import React from "react";
import Logo from "../assets/svg/logo.svg";

const Header = () => (
  <nav className="md:flex flex-wrap justify-between mt-5">
    <a href="/">
      <img className="w-64 cursor-pointer" src={Logo} alt="logo" />
    </a>
  </nav>
);

export default Header;
