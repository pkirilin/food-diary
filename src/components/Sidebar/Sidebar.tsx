import React from 'react';
import './Sidebar.scss';

const Sidebar: React.FC = props => {
  return <aside className="sidebar">{props?.children}</aside>;
};

export default Sidebar;
