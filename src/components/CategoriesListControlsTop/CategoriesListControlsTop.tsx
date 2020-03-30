import React from 'react';
import './CategoriesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListControlsTopConnected';

interface CategoriesListControlsTopProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const CategoriesListControlsTop: React.FC<CategoriesListControlsTopProps> = ({
  isCategoryOperationInProcess,
  areCategoriesLoading,
  getCategories,
  createDraftCategory,
}: CategoriesListControlsTopProps) => {
  const isControlDisabled = isCategoryOperationInProcess || areCategoriesLoading;

  const handleAddIconClick = (): void => {
    createDraftCategory({
      id: 0,
      name: '',
      countProducts: 0,
    });
  };

  const handleRefreshIconClick = (): void => {
    getCategories({});
  };

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <Icon type="add" onClick={handleAddIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="refresh" onClick={handleRefreshIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="filter" disabled={true}></Icon>
        <Icon type="close" disabled={true}></Icon>
      </SidebarControlPanelIcons>
    </SidebarControlPanel>
  );
};

export default CategoriesListControlsTop;
