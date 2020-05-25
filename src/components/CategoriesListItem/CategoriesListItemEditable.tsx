import React, { useState } from 'react';
import { Input } from '../Controls';
import { SidebarListItemControls, SidebarListItem } from '../SidebarBlocks';
import Icon from '../Icon';
import { useCategoryValidation } from '../../hooks';
import { CategoryItem } from '../../models';
import {
  CategoriesListItemEditableStateToPropsMapResult,
  CategoriesListItemEditableDispatchToPropsMapResult,
} from './CategoriesListItemEditableConnected';
import { CategoriesOperationsActionTypes } from '../../action-types';

interface CategoriesListItemEditableProps
  extends CategoriesListItemEditableStateToPropsMapResult,
    CategoriesListItemEditableDispatchToPropsMapResult {
  category: CategoryItem;
}

const CategoriesListItemEditable: React.FC<CategoriesListItemEditableProps> = ({
  category,
  categoryOperationStatus,
  productOperationStatus,
  productItemsFetchState,
  productsFilter,
  editCategory,
  getCategories,
  getProducts,
  setEditableForCategories,
}: CategoriesListItemEditableProps) => {
  const [categoryName, setCategoryName] = useState(category.name);
  const [isCategoryNameValid] = useCategoryValidation(categoryName);

  const { performing: isCategoryOperationInProcess } = categoryOperationStatus;
  const { performing: isProductOperationInProcess } = productOperationStatus;
  const { loading: areProductsLoading } = productItemsFetchState;

  const isAnySideEffectHappening = isCategoryOperationInProcess || isProductOperationInProcess || areProductsLoading;
  const isConfirmEditDisabled = isAnySideEffectHappening || !isCategoryNameValid;

  const handleCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    setCategoryName(target.value);
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const { type: editCategoryActionType } = await editCategory({
      id: category.id,
      category: {
        name: categoryName.trim(),
      },
    });

    if (editCategoryActionType === CategoriesOperationsActionTypes.EditSuccess) {
      setEditableForCategories([category.id], false);
      await getCategories();
      await getProducts(productsFilter);
    }
  };

  const handleCancelEditIconClick = (): void => {
    setEditableForCategories([category.id], false);
    setCategoryName(category.name);
  };

  return (
    <SidebarListItem editable>
      <Input
        type="text"
        placeholder="Enter category name"
        value={categoryName}
        onChange={handleCategoryNameChange}
        disabled={isAnySideEffectHappening}
      ></Input>
      <SidebarListItemControls>
        <Icon type="check" size="small" onClick={handleConfirmEditIconClick} disabled={isConfirmEditDisabled}></Icon>
        <Icon type="close" size="small" onClick={handleCancelEditIconClick} disabled={isAnySideEffectHappening}></Icon>
      </SidebarListItemControls>
    </SidebarListItem>
  );
};

export default CategoriesListItemEditable;
