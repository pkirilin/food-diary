import React from 'react';
import './Navbar.scss';
import NavbarBrand from './NavbarBrand';
import NavbarLinks from './NavbarLinks';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <NavbarBrand></NavbarBrand>
      <NavbarLinks>
        <NavLink exact to="/" activeClassName="selected">
          Pages
        </NavLink>
        <NavLink to="/products" activeClassName="selected">
          Products
        </NavLink>
        <NavLink to="/categories" activeClassName="selected">
          Categories
        </NavLink>
      </NavbarLinks>
    </header>
  );
};

export default Navbar;
