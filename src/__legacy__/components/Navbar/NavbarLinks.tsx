import React from 'react';
import './NavbarLinks.scss';
import { NavLink } from 'react-router-dom';

const NavbarLinks: React.FC = () => {
  return (
    <nav className="navbar-links">
      <NavLink to="/pages" className="navbar-links__link" activeClassName="navbar-links__link_selected">
        Pages
      </NavLink>
      <NavLink to="/products" className="navbar-links__link" activeClassName="navbar-links__link_selected">
        Products
      </NavLink>
      <NavLink to="/categories" className="navbar-links__link" activeClassName="navbar-links__link_selected">
        Categories
      </NavLink>
    </nav>
  );
};

export default NavbarLinks;
