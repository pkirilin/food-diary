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
import { CategoryItem } from '../../models';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListItemConnected';
import { Input, DropdownMenu, DropdownItem } from '../Controls';
import Icon from '../Icon';
import {
  CategoriesOperationsActionTypes,
  CategoriesListActionTypes,
  CreateCategorySuccessAction,
} from '../../action-types';
import { useCategoryValidation } from '../../hooks';
import { useHistory } from 'react-router-dom';

interface CategoriesListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: CategoryItem;
}

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({
  data: category,
  editableCategoriesIds,
  isCategoryOperationInProcess,
  isProductOperationInProcess,
  areProductsLoading,
  productsFilter,
  setEditableForCategories,
  deleteDraftCategory,
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
  getProducts,
}: CategoriesListItemProps) => {
  const [categoryName, setCategoryName] = useState(category.name);

  const activeLinkClassName = useActiveLinkClassName();
  const [isCategoryNameValid] = useCategoryValidation(categoryName);
  const history = useHistory();

  const isEditable = editableCategoriesIds.find(id => id === category.id) !== undefined;
  const isAnySideEffectHappening = isCategoryOperationInProcess || isProductOperationInProcess || areProductsLoading;
  const isConfirmEditDisabled = isAnySideEffectHappening || !isCategoryNameValid;

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
      const { type: deleteCategoryActionType } = await deleteCategory(category.id);

      if (deleteCategoryActionType === CategoriesOperationsActionTypes.DeleteSuccess) {
        await getCategories();
        history.push('/categories');
      }
    }
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    if (category.id < 1) {
      const createCategoryAction = await createCategory({
        name: categoryName.trim(),
      });

      if (createCategoryAction.type === CategoriesOperationsActionTypes.CreateSuccess) {
        deleteDraftCategory(category.id);
        const { type: getCategoriesActionType } = await getCategories();

        if (getCategoriesActionType === CategoriesListActionTypes.Success) {
          const { createdCategoryId } = createCategoryAction as CreateCategorySuccessAction;
          history.push(`/categories/${createdCategoryId}`);
        }
      }
    } else {
      const { type: editCategoryActionType } = await editCategory({
        id: category.id,
        name: categoryName.trim(),
      });

      if (editCategoryActionType === CategoriesOperationsActionTypes.EditSuccess) {
        setEditableForCategories([category.id], false);
        await getCategories();
        await getProducts(productsFilter);
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
              disabled={isConfirmEditDisabled}
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
