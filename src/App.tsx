import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, ReactElement } from "react";
import Layout from "./components/layout";
import hero from "./content/hero.json";
import resources from "./content/resources.json";

const IndexPage: FunctionComponent = (): ReactElement => (
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
);

export default IndexPage;
