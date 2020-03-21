import React, { useState } from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './ProductsTableRowConnected';
import { Input, DropdownList, categoryDropdownItemRenderer } from '../Controls';
import { DeleteProductSuccessAction, EditProductSuccessAction } from '../../action-types';
import { useDebounce } from '../../hooks';

interface ProductsTableRowProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  product: ProductItem;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({
  product,
  editableProductsIds,
  categoryDropdownItems,
  isProductOperationInProcess,
  isCategoryDropdownContentLoading,
  setEditableForProduct,
  getProducts,
  getCategoryDropdownItems,
  editProduct,
  deleteProduct,
}: ProductsTableRowProps) => {
  const [productNameInputValue, setProductNameInputValue] = useState(product.name);
  const [caloriesCost, setCaloriesCost] = useState(100);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [categoryNameInputValue, setCategoryNameInputValue] = useState(product.categoryName);

  const isProductEditable = editableProductsIds.find(id => id === product.id) !== undefined;

  const isAnyInputValueEmpty = productNameInputValue === '' || caloriesCost < 1 || categoryId < 1;
  const isInputDisabled = isProductOperationInProcess;
  const isConfirmEditIconDisabled = isInputDisabled || isAnyInputValueEmpty;

  const categoryNameChangeDebounce = useDebounce(() => {
    getCategoryDropdownItems();
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
    categoryNameChangeDebounce();
  };

  const handleCategoryDropdownContentOpen = (): void => {
    getCategoryDropdownItems();
  };

  const handleEditIconClick = (): void => {
    setEditableForProduct(product.id, true);
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const editProductAction = await editProduct({
      id: product.id,
      name: productNameInputValue,
      caloriesCost,
      categoryId,
    });

    if (editProductAction as EditProductSuccessAction) {
      setEditableForProduct(product.id, false);
      await getProducts();
    }
  };

  const handleCancelEditIconClick = (): void => {
    setEditableForProduct(product.id, false);
  };

  const handleDeleteIconClick = async (): Promise<void> => {
    const isDeleteConfirmed = window.confirm('Do you want to delete product?');
    if (isDeleteConfirmed) {
      const deleteProductAction = await deleteProduct(product.id);
      if (deleteProductAction as DeleteProductSuccessAction) {
        await getProducts();
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
