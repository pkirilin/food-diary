import React from 'react';
import './SidebarControlPanelIcons.scss';

const SidebarControlPanelIcons: React.FC = props => {
  return <div className="sidebar__control-panel__icons">{props?.children}</div>;
};

export default SidebarControlPanelIcons;
