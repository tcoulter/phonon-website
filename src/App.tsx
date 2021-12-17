import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, ReactElement } from "react";
import { ContentBlock } from "./components/ContentBlock";
import { ConvertToPhononButton } from "./components/ConvertToPhononButton";
import { Layout } from "./components/Layout";
import convert from "./content/convert.json";
import hero from "./content/hero.json";
import resources from "./content/resources.json";

const IndexPage: FunctionComponent = (): ReactElement => {
  return (
    <Layout>
      <ContentBlock>
        <h2 className="md:text-5xl text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-pink-300 via-indigo-300 to-green-500 mb-5">
          {hero.headline}
        </h2>
        {hero.paragraphs.map((paragraph) => (
          <p className="prose my-3">{paragraph}</p>
        ))}
        <div className="flex justify-evenly flex-wrap gap-4 mt-7">
          <a href={hero.buttonOne.link}>
            <button className="bg-gradient-to-br from-blue-300 to-green-300 text-black rounded p-2 px-5 mx-2 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-300/70 hover:hue-rotate-90 hover:shadow-lg ease-in-out duration-300">
              {hero.buttonOne.label}
            </button>
          </a>
          <a href={hero.buttonTwo.link}>
            <button className="bg-gradient-to-br from-green-300 via-blue-200 to-pink-300 text-black rounded p-2 px-5 mx-2 shadow-lg shadow-blue-200/40 hover:shadow-blue-100/70 hover:hue-rotate-90 hover:shadow-lg ease-in-out duration-300">
              {hero.buttonTwo.label}
            </button>
          </a>
          <a href={hero.buttonThree.link}>
            <button className="bg-gradient-to-br from-pink-300 to-indigo-300 text-black rounded p-2 px-5 mx-2 shadow-lg shadow-pink-200/40 hover:shadow-pink-300/70 hover:hue-rotate-90 hover:shadow-lg ease-in-out duration-300">
              {hero.buttonThree.label}
            </button>
          </a>
        </div>
      </ContentBlock>

      <ContentBlock>
        <h3 className="md:text-3xl text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-200 to-cyan-300 mb-5 text-center">
          {convert.header}
        </h3>
        {convert.paragraphs.map((paragraph) => (
          <p className="prose my-3 text-center">{paragraph}</p>
        ))}

        <ConvertToPhononButton />
      </ContentBlock>

      <div className="flex flex-wrap justify-between">
        <ContentBlock>
          <h3 className="md:text-3xl text-2xl text-indigo-300 py-2">
            Resources
          </h3>
          <ul className="list-disc list-inside">
            {resources.map((resource) => (
              <li className="prose" key="">
                <a href={resource.link} className="text-blue-400">
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </ContentBlock>
        <ContentBlock>
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
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="h-5 w-5 mr-2 my-1"
                />
                <p>Twitter</p>
              </a>
            </li>
            <li className="text-white">
              {/* TODO: Replace Placeholder Link */}
              <a
                href="https://github.com/GridPlus/phonon-network"
                className="flex"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="h-5 w-5 mr-2 my-1"
                />
                <p>Github</p>
              </a>
            </li>
            <li className="text-pink-200">
              <a href="https://www.twitter.com/phonondao" className="flex">
                <FontAwesomeIcon icon={faUsers} className="h-5 w-5 mr-2 my-1" />
                <p>Forum</p>
              </a>
            </li>
          </ul>
        </ContentBlock>
      </div>
    </Layout>
  );
};

export default IndexPage;
