import React from "react";
import { NavBar } from "./NavBar";

export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <div className="md:max-w-2xl px-8 mx-auto">
        <NavBar />
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-6">
        <main>
          <div className="md:max-w-2xl md:px-8 px-3 py-4 mx-auto text-white">
            {children}
          </div>
        </main>
        <footer></footer>
      </div>
    </>
  );
};
