import React from 'react';
import './CategoriesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListControlsTopConnected';
import { CategoriesListActionTypes } from '../../action-types';

interface CategoriesListControlsTopProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const CategoriesListControlsTop: React.FC<CategoriesListControlsTopProps> = ({
  isCategoryOperationInProcess,
  isProductOperationInProcess,
  areCategoriesLoading,
  areProductsLoading,
  productsFilter,
  getCategories,
  getProducts,
  createDraftCategory,
}: CategoriesListControlsTopProps) => {
  const isControlDisabled =
    isCategoryOperationInProcess || isProductOperationInProcess || areCategoriesLoading || areProductsLoading;

  const handleAddIconClick = (): void => {
    createDraftCategory({
      id: 0,
      name: '',
      countProducts: 0,
    });
  };

  const handleRefreshIconClick = async (): Promise<void> => {
    const { type: getCategoriesActionType } = await getCategories();

    if (getCategoriesActionType === CategoriesListActionTypes.Success) {
      await getProducts(productsFilter);
    }
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
