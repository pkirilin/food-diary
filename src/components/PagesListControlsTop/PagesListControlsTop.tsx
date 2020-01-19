import React from 'react';
import './PagesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons, SidebarControlPanelSelection } from '../SidebarBlocks';
import Icon from '../Icon';

const PagesListControlsTop: React.FC = () => {
  // TODO: take this from store when selection logic will be implemented
  const displaySelectionPanel = false;

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <Icon type="add"></Icon>
        <Icon type="refresh"></Icon>
        <Icon type="filter"></Icon>
        <Icon type="close"></Icon>
      </SidebarControlPanelIcons>
      {displaySelectionPanel && <SidebarControlPanelSelection></SidebarControlPanelSelection>}
    </SidebarControlPanel>
  );
};

export default PagesListControlsTop;
