import React from 'react';
import './NavbarLinks.scss';

const NavbarLinks: React.FC = props => {
  return <nav className="navbar__links">{props?.children}</nav>;
};

export default NavbarLinks;
