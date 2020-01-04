import React from 'react';
import './PagesListControlPanel.scss';
import { FDListControlPanel, FDListControlPanelIcons, FDListControlPanelSelection } from '../List';
import { IconAdd, IconRefresh, IconFilter, IconFilterReset } from '../Icons';

const PagesListControlPanel: React.FC = () => {
  // TODO: take this from store when selection logic will be implemented
  const displaySelectionPanel = false;

  return (
    <FDListControlPanel>
      <FDListControlPanelIcons>
        <IconAdd></IconAdd>
        <IconRefresh></IconRefresh>
        <IconFilter></IconFilter>
        <IconFilterReset></IconFilterReset>
      </FDListControlPanelIcons>
      {displaySelectionPanel && <FDListControlPanelSelection></FDListControlPanelSelection>}
    </FDListControlPanel>
  );
};

export default PagesListControlPanel;
