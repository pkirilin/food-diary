import React from 'react';
import './CategoriesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import {
  CategoriesListControlsTopStateToPropsMapResult,
  CategoriesListControlsTopDispatchToPropsMapResult,
} from './CategoriesListControlsTopConnected';
import { CategoriesListActionTypes } from '../../action-types';
import { useRouteMatch } from 'react-router-dom';
import CategoryCreateFormConnected from '../CategoryCreateForm';
import { Icon } from '../__ui__';

interface CategoriesListControlsTopProps
  extends CategoriesListControlsTopStateToPropsMapResult,
    CategoriesListControlsTopDispatchToPropsMapResult {}

const CategoriesListControlsTop: React.FC<CategoriesListControlsTopProps> = ({
  isCategoryOperationInProcess,
  isProductOperationInProcess,
  areCategoriesLoading,
  areProductsLoading,
  productsFilter,
  getCategories,
  getProducts,
  openModal,
}: CategoriesListControlsTopProps) => {
  const match = useRouteMatch<{ [key: string]: string }>('/categories/:id');

  const isControlDisabled =
    isCategoryOperationInProcess || isProductOperationInProcess || areCategoriesLoading || areProductsLoading;

  const handleAddIconClick = (): void => {
    openModal('New category', <CategoryCreateFormConnected></CategoryCreateFormConnected>, {
      width: '35%',
    });
  };

  const handleRefreshIconClick = async (): Promise<void> => {
    const { type: getCategoriesActionType } = await getCategories();

    if (getCategoriesActionType === CategoriesListActionTypes.Success) {
      const matchParams = match?.params;
      // Prevents products request when no category selected
      if (matchParams && !isNaN(+matchParams['id'])) {
        await getProducts(productsFilter);
      }
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
