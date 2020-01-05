import React from 'react';
import './PagesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons, SidebarControlPanelSelection } from '../SidebarBlocks';
import { IconAdd, IconRefresh, IconFilter, IconFilterReset } from '../Icons';

const PagesListControlsTop: React.FC = () => {
  // TODO: take this from store when selection logic will be implemented
  const displaySelectionPanel = false;

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <IconAdd></IconAdd>
        <IconRefresh></IconRefresh>
        <IconFilter></IconFilter>
        <IconFilterReset></IconFilterReset>
      </SidebarControlPanelIcons>
      {displaySelectionPanel && <SidebarControlPanelSelection></SidebarControlPanelSelection>}
    </SidebarControlPanel>
  );
};

export default PagesListControlsTop;
