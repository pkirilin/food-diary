import React from 'react';
import './PagesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons, SidebarControlPanelSelection } from '../SidebarBlocks';
import Icon from '../Icon';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListControlsTopConnected';

interface PagesListControlsTopProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesListControlsTop: React.FC<PagesListControlsTopProps> = ({
  createDraftPage,
  pagesFilter,
  pagesFilterChanged,
  clearPagesFilter,
  getPages,
}: PagesListControlsTopProps) => {
  // TODO: take this from store when selection logic will be implemented
  const displaySelectionPanel = false;

  const handleAddIconClick = (): void => {
    createDraftPage({
      id: 0,
      date: '',
      countNotes: 0,
      countCalories: 0,
    });
  };

  const handleRefreshPagesListIconClick = (): void => {
    getPages(pagesFilter);
  };

  const handleResetFilterIconClick = (): void => {
    clearPagesFilter();
  };

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <Icon type="add" onClick={handleAddIconClick}></Icon>
        <Icon type="refresh" onClick={handleRefreshPagesListIconClick}></Icon>
        <Icon type="filter" disabled></Icon>
        <Icon type="close" disabled={!pagesFilterChanged} onClick={handleResetFilterIconClick}></Icon>
      </SidebarControlPanelIcons>
      {displaySelectionPanel && <SidebarControlPanelSelection></SidebarControlPanelSelection>}
    </SidebarControlPanel>
  );
};

export default PagesListControlsTop;
