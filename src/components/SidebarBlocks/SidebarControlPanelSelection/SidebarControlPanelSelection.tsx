import React from 'react';
import './SidebarControlPanelSelection.scss';
import Icon from '../../Icon';

const SidebarControlPanelSelection: React.FC = () => {
  return (
    <div className="sidebar-control-panel-selection">
      <div>Selected</div>
      <Icon type="three-dots"></Icon>
    </div>
  );
};

export default SidebarControlPanelSelection;
