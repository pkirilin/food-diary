import React, { useState } from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';
import Icon from '../Icon';
import {
  ProductsTableRowStateToPropsMapResult,
  ProductsTableRowDispatchToPropsMapResult,
} from './ProductsTableRowConnected';
import { Input, DropdownList, categoryDropdownItemRenderer } from '../Controls';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useDebounce, useProductValidation } from '../../hooks';

interface ProductsTableRowProps
  extends ProductsTableRowStateToPropsMapResult,
    ProductsTableRowDispatchToPropsMapResult {
  product: ProductItem;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({
  product,
  editableProductsIds,
  categoryDropdownItems,
  isProductOperationInProcess,
  isCategoryDropdownContentLoading,
  productsFilter,
  setEditableForProduct,
  getProducts,
  getCategoryDropdownItems,
  getCategories,
  editProduct,
  deleteProduct,
}: ProductsTableRowProps) => {
  const [productNameInputValue, setProductNameInputValue] = useState(product.name);
  const [caloriesCost, setCaloriesCost] = useState(product.caloriesCost);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [categoryNameInputValue, setCategoryNameInputValue] = useState(product.categoryName);

  const [isProductNameValid, isCaloriesCostValid, isCategoryNameValid] = useProductValidation(
    productNameInputValue,
    caloriesCost,
    categoryNameInputValue,
  );

  const isProductEditable = editableProductsIds.find(id => id === product.id) !== undefined;

  const isInputDisabled = isProductOperationInProcess;
  const isConfirmEditIconDisabled =
    isInputDisabled || !isProductNameValid || !isCaloriesCostValid || !isCategoryNameValid;

  const categoryNameChangeDebounce = useDebounce((newCategoryName?: string) => {
    getCategoryDropdownItems({
      categoryNameFilter: newCategoryName,
    });
  });

  const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    setProductNameInputValue(target.value);
  };

  const handleCaloriesCostChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const caloriesCostNumber = !isNaN(+target.value) ? +target.value : 0;
    setCaloriesCost(caloriesCostNumber);
  };

  const handleCategoryDropdownItemSelect = (newSelectedCategoryIndex: number): void => {
    const { id, name } = categoryDropdownItems[newSelectedCategoryIndex];
    setCategoryId(id);
    setCategoryNameInputValue(name);
  };

  const handleCategoryNameDropdownInputChange = (newCategoryNameInputValue: string): void => {
    setCategoryNameInputValue(newCategoryNameInputValue);
    categoryNameChangeDebounce(newCategoryNameInputValue);
  };

  const handleCategoryDropdownContentOpen = (): void => {
    getCategoryDropdownItems({
      categoryNameFilter: categoryNameInputValue,
    });
  };

  const handleEditIconClick = (): void => {
    setEditableForProduct(product.id, true);
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const { type: editProductActionType } = await editProduct({
      id: product.id,
      product: {
        name: productNameInputValue.trim(),
        caloriesCost,
        categoryId,
      },
    });

    if (editProductActionType === ProductsOperationsActionTypes.EditSuccess) {
      setEditableForProduct(product.id, false);
      await getProducts(productsFilter);
    }
  };

  const handleCancelEditIconClick = (): void => {
    setEditableForProduct(product.id, false);
    setProductNameInputValue(product.name);
    setCaloriesCost(product.caloriesCost);
    setCategoryId(product.categoryId);
    setCategoryNameInputValue(product.categoryName);
  };

  const handleDeleteIconClick = async (): Promise<void> => {
    const isDeleteConfirmed = window.confirm('Do you want to delete product?');

    if (isDeleteConfirmed) {
      const { type: deleteProductActionType } = await deleteProduct(product.id);

      if (deleteProductActionType === ProductsOperationsActionTypes.DeleteSuccess) {
        await getProducts(productsFilter);
        await getCategories();
      }
    }
  };

  return (
    <tr>
      <td>
        {isProductEditable ? (
          <Input
            type="text"
            placeholder="Product name"
            value={productNameInputValue}
            onChange={handleProductNameChange}
            disabled={isInputDisabled}
            controlSize="small"
          ></Input>
        ) : (
          product.name
        )}
      </td>
      <td>
        {isProductEditable ? (
          <Input
            type="number"
            placeholder="Calories per 100g"
            value={caloriesCost}
            onChange={handleCaloriesCostChange}
            disabled={isInputDisabled}
            controlSize="small"
          ></Input>
        ) : (
          product.caloriesCost
        )}
      </td>
      <td>
        {isProductEditable ? (
          <DropdownList
            items={categoryDropdownItems}
            itemRenderer={categoryDropdownItemRenderer}
            placeholder="Select category"
            searchable={true}
            inputValue={categoryNameInputValue}
            isContentLoading={isCategoryDropdownContentLoading}
            disabled={isInputDisabled}
            onValueSelect={handleCategoryDropdownItemSelect}
            onInputValueChange={handleCategoryNameDropdownInputChange}
            onContentOpen={handleCategoryDropdownContentOpen}
            controlSize="small"
          ></DropdownList>
        ) : (
          product.categoryName
        )}
      </td>
      <td>
        {isProductEditable ? (
          <Icon
            type="check"
            size="small"
            disabled={isConfirmEditIconDisabled}
            onClick={handleConfirmEditIconClick}
          ></Icon>
        ) : (
          <Icon type="edit" size="small" disabled={isInputDisabled} onClick={handleEditIconClick}></Icon>
        )}
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          disabled={isInputDisabled}
          onClick={isProductEditable ? handleCancelEditIconClick : handleDeleteIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default ProductsTableRow;
