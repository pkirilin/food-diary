import React from 'react';
import './SidebarListItemCheckbox.scss';

const SidebarListItemCheckbox: React.FC = props => {
  return <div className="sidebar-list-item-checkbox">{props?.children}</div>;
};

export default SidebarListItemCheckbox;
