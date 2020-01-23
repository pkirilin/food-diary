import React from 'react';
import './Navbar.scss';
import NavbarBrand from './NavbarBrand';
import NavbarLinks from './NavbarLinks';

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <NavbarBrand></NavbarBrand>
      <NavbarLinks></NavbarLinks>
    </header>
  );
};

export default Navbar;
