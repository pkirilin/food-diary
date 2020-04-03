import React, { useState } from 'react';
import './CategoriesListItem.scss';
import {
  SidebarListItem,
  SidebarListItemLink,
  SidebarListItemControls,
  useActiveLinkClassName,
} from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';
import { CategoryItem, CategoryCreateEdit } from '../../models';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListItemConnected';
import { Input, DropdownMenu, DropdownItem } from '../Controls';
import Icon from '../Icon';
import {
  DeleteCategorySuccessAction,
  CreateCategorySuccessAction,
  EditCategorySuccessAction,
} from '../../action-types';

interface CategoriesListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: CategoryItem;
}

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({
  data: category,
  editableCategoriesIds,
  isCategoryOperationInProcess,
  isProductOperationInProcess,
  areProductsLoading,
  setEditableForCategories,
  deleteDraftCategory,
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
}: CategoriesListItemProps) => {
  const [categoryName, setCategoryName] = useState(category.name);

  const activeLinkClassName = useActiveLinkClassName();

  const isEditable = editableCategoriesIds.find(id => id === category.id) !== undefined;
  const isAnySideEffectHappening = isCategoryOperationInProcess || isProductOperationInProcess || areProductsLoading;

  const categoryProductsBadgeLabel = `${category.countProducts} ${
    category.countProducts === 1 ? 'product' : 'products'
  }`;

  const handleCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    setCategoryName(target.value);
  };

  const handleEditItemClick = (): void => {
    setEditableForCategories([category.id], true);
  };

  const handleDeleteItemClick = async (): Promise<void> => {
    const isDeleteConfirmed = window.confirm('Do you want to delete category?');
    if (isDeleteConfirmed) {
      const deleteCategoryAction = await deleteCategory(category.id);
      if (deleteCategoryAction as DeleteCategorySuccessAction) {
        await getCategories();
      }
    }
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const categoryForOperation: CategoryCreateEdit = {
      id: category.id,
      name: categoryName,
    };

    if (category.id < 1) {
      const createCategoryAction = await createCategory(categoryForOperation);
      if (createCategoryAction as CreateCategorySuccessAction) {
        deleteDraftCategory(category.id);
        await getCategories();
      }
    } else {
      const editCategoryAction = await editCategory(categoryForOperation);
      if (editCategoryAction as EditCategorySuccessAction) {
        setEditableForCategories([category.id], false);
        await getCategories();
      }
    }
  };

  const handleCancelEditIconClick = (): void => {
    if (category.id < 1) {
      deleteDraftCategory(category.id);
    } else {
      setEditableForCategories([category.id], false);
      setCategoryName(category.name);
    }
  };

  return (
    <SidebarListItem editable={isEditable}>
      {isEditable ? (
        <React.Fragment>
          <Input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={handleCategoryNameChange}
            disabled={isAnySideEffectHappening}
          ></Input>
          <SidebarListItemControls>
            <Icon
              type="check"
              size="small"
              onClick={handleConfirmEditIconClick}
              disabled={isAnySideEffectHappening}
            ></Icon>
            <Icon
              type="close"
              size="small"
              onClick={handleCancelEditIconClick}
              disabled={isAnySideEffectHappening}
            ></Icon>
          </SidebarListItemControls>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <SidebarListItemLink to={`/categories/${category.id}`} activeClassName={activeLinkClassName} selected={false}>
            <div>{category.name}</div>
            <BadgesContainer>
              <Badge label={categoryProductsBadgeLabel} selected={false}></Badge>
            </BadgesContainer>
          </SidebarListItemLink>
          <SidebarListItemControls>
            <DropdownMenu
              toggler={<Icon type="three-dots"></Icon>}
              contentAlignment="right"
              contentWidth={150}
              disabled={isAnySideEffectHappening}
            >
              <DropdownItem onClick={handleEditItemClick}>Edit category</DropdownItem>
              <DropdownItem onClick={handleDeleteItemClick}>Delete category</DropdownItem>
            </DropdownMenu>
          </SidebarListItemControls>
        </React.Fragment>
      )}
    </SidebarListItem>
  );
};

export default CategoriesListItem;
