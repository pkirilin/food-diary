import React from 'react';
import './SidebarSelectionPanel.scss';

const SidebarSelectionPanel: React.FC = props => {
  return <div className="sidebar-selection-panel">{props?.children}</div>;
};

export default SidebarSelectionPanel;
