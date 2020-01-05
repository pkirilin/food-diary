import React from 'react';
import './SidebarControlPanelSelection.scss';
import { IconMore } from '../../Icons';

const SidebarControlPanelSelection: React.FC = () => {
  return (
    <div className="sidebar__control-panel__selection">
      <div>Selected</div>
      <IconMore></IconMore>
    </div>
  );
};

export default SidebarControlPanelSelection;
