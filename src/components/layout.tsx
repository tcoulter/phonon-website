import React from "react";
// import '../assets/styles/global.css';
import Header from "./header";

//@ts-ignore
const Layout = ({ children }) => {
  return (
    <>
      <div className="md:max-w-2xl px-8 mx-auto">
        <Header />
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-6">
        <main>
          <div className="md:max-w-2xl md:px-8 px-3 py-4 mx-auto">
            {children}
          </div>
        </main>
        <footer></footer>
      </div>
    </>
  );
};

export default Layout;
