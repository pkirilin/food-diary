import React, { useState } from 'react';
import { ProductItem } from '../../models';
import { useProductValidation, useProductInputDisabled, useDebounce } from '../../hooks';
import {
  ProductsTableRowEditableStateToPropsMapResult,
  ProductsTableRowEditableDispatchToPropsMapResult,
} from './ProductsTableRowEditableConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { Icon, Input, DropdownList, categoryDropdownItemRenderer } from '../__ui__';

interface ProductsTableRowEditableProps
  extends ProductsTableRowEditableStateToPropsMapResult,
    ProductsTableRowEditableDispatchToPropsMapResult {
  product: ProductItem;
}

const ProductsTableRowEditable: React.FC<ProductsTableRowEditableProps> = ({
  product,
  isProductOperationInProcess,
  isCategoryOperationInProcess,
  categoryDropdownItems,
  categoryDropdownItemsFetchState,
  productsFilter,
  getCategoryDropdownItems,
  editProduct,
  setEditableForProduct,
  getProducts,
}: ProductsTableRowEditableProps) => {
  const [productNameInputValue, setProductNameInputValue] = useState(product.name);
  const [caloriesCost, setCaloriesCost] = useState(product.caloriesCost);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [categoryNameInputValue, setCategoryNameInputValue] = useState(product.categoryName);
  const [isProductNameValid, isCaloriesCostValid, isCategoryNameValid] = useProductValidation(
    productNameInputValue,
    caloriesCost,
    categoryNameInputValue,
  );

  const isProductInputDisabled = useProductInputDisabled(isProductOperationInProcess, isCategoryOperationInProcess);
  const isConfirmEditIconDisabled =
    isProductInputDisabled || !isProductNameValid || !isCaloriesCostValid || !isCategoryNameValid;

  const {
    loading: isCategoryDropdownContentLoading,
    loadingMessage: categoryDropdownItemsLoadingMessage,
    error: categoryDropdownItemsErrorMessage,
  } = categoryDropdownItemsFetchState;

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
  };

  return (
    <tr>
      <td>
        <Input
          type="text"
          placeholder="Product name"
          value={productNameInputValue}
          onChange={handleProductNameChange}
          disabled={isProductInputDisabled}
          controlSize="small"
        ></Input>
      </td>
      <td>
        <Input
          type="number"
          placeholder="Calories per 100g"
          value={caloriesCost}
          onChange={handleCaloriesCostChange}
          disabled={isProductInputDisabled}
          controlSize="small"
        ></Input>
      </td>
      <td>
        <DropdownList
          items={categoryDropdownItems}
          itemRenderer={categoryDropdownItemRenderer}
          placeholder="Select category"
          searchable={true}
          inputValue={categoryNameInputValue}
          isContentLoading={isCategoryDropdownContentLoading}
          contentLoadingMessage={categoryDropdownItemsLoadingMessage}
          contentErrorMessage={categoryDropdownItemsErrorMessage}
          disabled={isProductInputDisabled}
          onValueSelect={handleCategoryDropdownItemSelect}
          onInputValueChange={handleCategoryNameDropdownInputChange}
          onContentOpen={handleCategoryDropdownContentOpen}
          controlSize="small"
        ></DropdownList>
      </td>
      <td>
        <Icon
          type="check"
          size="small"
          title="Save product changes"
          disabled={isConfirmEditIconDisabled}
          onClick={handleConfirmEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          title="Cancel product changes"
          disabled={isProductInputDisabled}
          onClick={handleCancelEditIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default ProductsTableRowEditable;
