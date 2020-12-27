import React from 'react';
import './SidebarControlPanel.scss';

const SidebarControlPanel: React.FC = props => {
  return <div className="sidebar-control-panel">{props?.children}</div>;
};

export default SidebarControlPanel;
