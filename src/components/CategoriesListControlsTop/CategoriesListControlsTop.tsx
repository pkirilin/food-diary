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
        <Icon type="add" title="Create new category" onClick={handleAddIconClick} disabled={isControlDisabled}></Icon>
        <Icon
          type="refresh"
          title="Refresh categories"
          onClick={handleRefreshIconClick}
          disabled={isControlDisabled}
        ></Icon>
        <Icon type="filter" title="Filter categories" disabled={true}></Icon>
        <Icon type="close" title="Clear categories filter" disabled={true}></Icon>
      </SidebarControlPanelIcons>
    </SidebarControlPanel>
  );
};

export default CategoriesListControlsTop;
