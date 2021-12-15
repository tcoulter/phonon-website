import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { useUserAddress } from "eth-hooks";
import { useTokenBalance } from "eth-hooks/erc";
import { ethers } from "ethers";
import { EthersModalConnector, useEthersContext } from "eth-hooks/context"
import Layout from "./components/layout";
import hero from "./content/hero.json";
import resources from "./content/resources.json";

// There's no types for eth-provider, so we need to require() it.
const ethProvider = require("eth-provider");

// Constants for token addresses. These differ by network.
// 
// For Rinkeby: 
// 
//    GRID_TOKEN_ADDRESS: 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
//    
//    --> This is the DAI token faucet on Rinkeby, as there's no need
//        to deploy a separate ERC20 (we'll just redeem for DAI instead
//        of GRID). Note that in the same fashion, you will not receive
//        PHONON tokens in return. You'll redeem rDAI for rUSDC. 
//
//        You can get DAI tokens to use in redemption by using Compound.
//        Go to https://app.compound.finance/ while connected to Rinkeby,
//        click "Dai" or "USD Coin" under Supply Markets, click Withdraw,
//        then click "Faucet" at the bottom of the modal.
//    
//    PHONON_TOKEN_ADDRESS: 0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b
//    
//    --> Like above, this points to the USDC test contract on Rinkeby,
//        since there's no need to deploy another ERC20 in order to test
//        out the redemption contract. 
//    
//    REDEEMER_CONTRACT_ADDRESS: 0x49d1ddbC2C847dd7EA03C1813915C12347FBC574
//       
//    --> This is a test contract deployed to Rinkeby configured with the
//        above two addresses. 
//
// For Mainnet:
//    
//   TBD
//

const GRID_TOKEN_ADDRESS = "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea";
const PHONON_TOKEN_ADDRESS = "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b"
const REDEEMER_CONTRACT_ADDRESS = "0x49d1ddbC2C847dd7EA03C1813915C12347FBC574";

// TODO: Make sure this matches the final deployment in the contracts. 
const PHONON_REDEMPTION_MULTIPLIER = 155;

const ERC20_FUNCTIONS = [
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function decimals() public view returns (uint8)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)"
];

const IndexPage: FunctionComponent = (): ReactElement => {

  const [error, setError] = useState("");

  const [gridDecimals, setGridDecimals] = useState(12);
  const [gridBalance, setGridBalance] = useState(BigInt(-1)); // -1 signals it hasn't been pulled
  const [gridAllowance, setGridAllowance] = useState(BigInt(0))
  const [phononDecimals, setPhononDecimals] = useState(18);
  const [phononBalance, setPhononBalance] = useState(BigInt(-1)); // -1 signals it hasn't been pulled

  const [isLoading, setIsLoading] = useState(false);

  // Set up the connector so we can use web3Modal through ethersContext 
  const connector = useMemo(() => {
    return new EthersModalConnector({
      providerOptions: {
        frame: ethProvider
      },
    }, {
      reloadOnNetworkChange: false,
      immutableProvider: true
    }, undefined, true)
  }, [])

  const ethersContext = useEthersContext();
  const address = useUserAddress(ethersContext.signer);

  // Set up the contract objects we'll use throughout the code.
  const gridToken = useMemo(() => {
    return new ethers.Contract(GRID_TOKEN_ADDRESS, ERC20_FUNCTIONS, ethersContext.signer);
  }, [ethersContext.signer]);

  const phononToken = useMemo(() => {
    return new ethers.Contract(PHONON_TOKEN_ADDRESS, ERC20_FUNCTIONS, ethersContext.ethersProvider);
  }, [ethersContext.ethersProvider]);

  const redeemer = useMemo(() => {
    return new ethers.Contract(REDEEMER_CONTRACT_ADDRESS, [
      "function redeem() external"
    ], ethersContext.signer);
  }, [ethersContext.signer]);

  // Set up some default values we only need to get once.
  useEffect(() => {
    if (ethersContext.active === false || typeof address === "undefined") {
      return;
    }

    async function run() {
      let gridDecimals:number = await gridToken.decimals();
      let phononDecimals:number = await phononToken.decimals();
      setGridDecimals(gridDecimals);
      setPhononDecimals(phononDecimals);
    };

    run();
  }, [ethersContext.active, address, gridToken, phononToken])

  // Create an all-purpose function that updates everything we need.
  const updateBalances = useCallback(async () => {
    if (typeof ethersContext.ethersProvider === "undefined" || typeof address === "undefined") {
      return undefined;
    }

    let gridBalance:ethers.BigNumber = await gridToken.balanceOf(address); 
    let gridAllowance:ethers.BigNumber = await gridToken.allowance(address, REDEEMER_CONTRACT_ADDRESS)
    let phononBalance:ethers.BigNumber = await phononToken.balanceOf(address); 

    setGridBalance(gridBalance.toBigInt());
    setGridAllowance(gridAllowance.toBigInt())
    setPhononBalance(phononBalance.toBigInt());
  }, [gridToken, phononToken, address]);

  // Poll for new balances. TODO: Figure out why I couldn't get useTokenBalance hook
  // to work. If not using useTokenBalance, poll every new block. 
  let pollingTimeoutId:NodeJS.Timeout|undefined;
  pollingTimeoutId = useMemo(() => {
    if (typeof pollingTimeoutId !== "undefined") {
      clearTimeout(pollingTimeoutId);
    }

    // Update balances immediately.
    updateBalances();

    // Then set up the polling.
    return setTimeout(updateBalances, 1000);
  }, [updateBalances])

  const displayBalance = (balance:bigint, decimals:number) => {
    let asString = (balance / BigInt(Math.pow(10, decimals))).toString(10);
    // Double parseFloat to remove unneeded zeroes on the right side
    return parseFloat(parseFloat(asString).toFixed(4)); 
  }

  // Figure out the amount of expected PHONON taking into account
  // the decimal places of each token. The code takes into account
  // either decimal amount being larger, even though only one path
  // will be taken on final deployment. Easier for testing.
  const expectedPhonon = useMemo(() => {
    let expectedBalance = gridBalance;

    if (gridDecimals < phononDecimals) {
      expectedBalance = expectedBalance * BigInt(Math.pow(10, phononDecimals - gridDecimals));
    }

    if (phononDecimals < gridDecimals) {
      expectedBalance = expectedBalance / BigInt(Math.pow(10, gridDecimals - phononDecimals));
    }

    expectedBalance *= BigInt(PHONON_REDEMPTION_MULTIPLIER);

    return expectedBalance;
  }, [gridBalance, gridDecimals, phononDecimals])

  return (
    <Layout>
      <div className="backdrop-blur rounded-3xl md:p-10 p-1 mb-5">
        <h2 className="md:text-5xl text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-indigo-300 to-green-500 p-2 mb-5">
          {hero.headline}
        </h2>
        {hero.paragraphs.map((paragraph) => (
          <p className="prose my-3">{paragraph}</p>
        ))}
        <div className="flex justify-evenly my-5">
          <a href={hero.buttonOne.link}>
            <button className="bg-gradient-to-br from-blue-300 to-green-300 text-black rounded p-2 px-5">
              {hero.buttonOne.label}
            </button>
          </a>
          <a href={hero.buttonTwo.link}>
            <button className="bg-gradient-to-br from-pink-300 to-indigo-300 text-black rounded  p-2 px-5">
              {hero.buttonTwo.label}
            </button>
          </a>
        </div>
      </div>

      <div className="backdrop-blur rounded-3xl md:p-10 p-1 mb-5">
        <h3 className="md:text-3xl text-2xl text-red-300 py-2">Redeem PHONON</h3>
        <p className="prose my-3">Convert your GRID to PHONON</p>

          {ethersContext.active === false && 
            <>
              <button 
                className="bg-gradient-to-br from-pink-300 to-indigo-300 text-black rounded  p-2 px-5"
                onClick={() => {
                  ethersContext.openModal(connector)
                }}
              >
                Connect Wallet
              </button>
            </>
          }
          {ethersContext.active === true &&
            <>
              {/* If we have grid, show redemption dialog. */ }
              {gridBalance > BigInt(0) &&
                <>
                  <p className="bg-green-400">Connected as {address?.substring(0,8)}...{address?.substring(34)}</p>
                  <p className="bg-white">You have {displayBalance(gridBalance, gridDecimals)} GRID</p>
                  {gridAllowance < gridBalance && 
                    <button 
                    className="bg-gradient-to-br from-pink-300 to-indigo-300 text-black rounded  p-2 px-5"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        let tx:TransactionResponse = await gridToken.approve(REDEEMER_CONTRACT_ADDRESS, gridBalance);
                        await tx.wait(1) // 2 confirmations
                        setIsLoading(false);
                        updateBalances();
                      } catch (e) {
                        console.log(e);
                        setIsLoading(false);
                        setError("Error approving. Please try again or contact support.");
                      }
                    }}
                  >
                    {isLoading === true ? "Approving..." : "Allow PHONON to convert GRID tokens"}
                  </button>
                  }
                  {gridAllowance >= gridBalance && 
                    <button 
                      className="bg-gradient-to-br from-pink-300 to-indigo-300 text-black rounded  p-2 px-5"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          let tx:TransactionResponse = await redeemer.redeem();
                          let receipt = await tx.wait(1);
                          setIsLoading(false);
                          updateBalances();
                        } catch (e) {
                          console.log(e);
                          setIsLoading(false);
                          setError("Error redeeming tokens. Please try again or contact support.");
                        }
                      }}
                    >
                      {isLoading === true ? "Redeeming..." : `Redeem ${displayBalance(expectedPhonon, phononDecimals)} PHONON`}
                    </button>
                  }
                </>
              }

              {/* If we have phonon and no grid, show success message. */ }
              {gridBalance == BigInt(0) && phononBalance > BigInt(0) && 
                <p className="prose my-3">You have successfully redeemed {displayBalance(phononBalance, phononDecimals)} PHONON</p>
              }
              {/* If we have no phonon and no grid, then the user can't redeem (and hasn't yet redeemed).*/}
              {gridBalance == BigInt(0) && phononBalance == BigInt(0) && 
                <p className="prose my-3">You do not have any GRID to redeem</p>
              }
              {gridBalance == BigInt(-1) && 
                <p className="prose my-3">Retrieving GRID balance...</p>
              }
            </>
          } 
          {(error != "" || typeof ethersContext.error !== "undefined") && 
            <p className="bg-red-400">{error || ethersContext.error}</p>
          }

      </div>

      <div className=" flex flex-wrap justify-between">
        <div className="backdrop-blur rounded-3xl p-8 my-3 md:flex-none flex-1">
          <h3 className="md:text-3xl text-2xl text-indigo-300 py-2">Resources</h3>
          <ul className="list-disc list-inside">
            {resources.map((resource) => (
              <li className="prose" key="">
                <a href={resource.link}>{resource.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="backdrop-blur rounded-3xl p-8 px-11 my-3 md:flex-none flex-1">
          <h3 className="md:text-3xl text-2xl text-green-300 py-2">Social</h3>
          <ul>
            {/* TODO: Add Discord
            <li>
                <a href="" className="flex">
                  <FontAwesomeIcon
                    icon={faDiscord}
                    className="h-5 w-5 mr-2 my-1"
                  />
                  <p>Discord</p>
                </a>
              </li> */}
            <li className="text-blue-300">
              <a href="https://www.twitter.com/phonondao" className="flex">
                <FontAwesomeIcon icon={faTwitter} className="h-5 w-5 mr-2 my-1" />
                <p>Twitter</p>
              </a>
            </li>
            <li className="text-white">
              {/* TODO: Replace Placehoder */}
              <a
                href="https://github.com/GridPlus/phonon-network"
                className="flex"
              >
                <FontAwesomeIcon icon={faGithub} className="h-5 w-5 mr-2 my-1" />
                <p>Github</p>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
};

export default IndexPage;
