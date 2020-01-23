import React from 'react';
import './SidebarList.scss';

const SidebarList: React.FC = props => {
  return <div className="sidebar-list">{props?.children}</div>;
};

export default SidebarList;
