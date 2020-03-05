import React from 'react';
import './PagesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import Icon from '../Icon';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListControlsTopConnected';

interface PagesListControlsTopProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesListControlsTop: React.FC<PagesListControlsTopProps> = ({
  createDraftPage,
  pagesFilter,
  isPagesFilterChanged,
  clearPagesFilter,
  getPages,
  arePagesLoading,
  areNotesForMealLoading,
  areNotesForPageLoading,
  isPageOperationInProcess,
  isNoteOperationInProcess,
}: PagesListControlsTopProps) => {
  const isControlDisabled =
    arePagesLoading ||
    areNotesForMealLoading ||
    areNotesForPageLoading ||
    isPageOperationInProcess ||
    isNoteOperationInProcess;

  const isClearFilterDisabled = isControlDisabled || !isPagesFilterChanged;

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
        <Icon type="add" onClick={handleAddIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="refresh" onClick={handleRefreshPagesListIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="filter" disabled></Icon>
        <Icon type="close" disabled={isClearFilterDisabled} onClick={handleResetFilterIconClick}></Icon>
      </SidebarControlPanelIcons>
    </SidebarControlPanel>
  );
};

export default PagesListControlsTop;
