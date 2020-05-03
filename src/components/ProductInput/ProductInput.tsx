import React, { useState, useEffect, useCallback } from 'react';
import './ProductInput.scss';
import { FormGroup, Input, Label, Button, DropdownList, categoryDropdownItemRenderer } from '../Controls';
import Loader from '../Loader';
import { ProductInputStateToPropsMapResult, ProductInputDispatchToPropsMapResult } from './ProductInputConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useDebounce, useProductValidation } from '../../hooks';

interface ProductInputProps extends ProductInputStateToPropsMapResult, ProductInputDispatchToPropsMapResult {}

const ProductInput: React.FC<ProductInputProps> = ({
  productOperationStatus,
  productItemsFetchState,
  categoryItems,
  categoryDropdownItems,
  categoryDropdownItemsFetchState,
  productsFilter,
  createProduct,
  getProducts,
  getCategoryDropdownItems,
  getCategories,
}: ProductInputProps) => {
  const [productNameInputValue, setProductNameInputValue] = useState('');
  const [caloriesCost, setCaloriesCost] = useState(100);
  const [categoryId, setCategoryId] = useState(0);
  const [categoryNameInputValue, setCategoryNameInputValue] = useState('');

  const { performing: isOperationInProcess, message: operationMessage } = productOperationStatus;
  const { loading: isProductsTableLoading } = productItemsFetchState;
  const {
    loading: isCategoryDropdownContentLoading,
    error: categoryDropdownContentErrorMessage,
    loadingMessage: categoryDropdownContentLoadingMessage,
  } = categoryDropdownItemsFetchState;

  const [isProductNameValid, isCaloriesCostValid, isCategoryNameValid] = useProductValidation(
    productNameInputValue,
    caloriesCost,
    categoryNameInputValue,
  );

  const isInputDisabled = isOperationInProcess || isProductsTableLoading;
  const isAddButtonDisabled = isInputDisabled || !isProductNameValid || !isCaloriesCostValid || !isCategoryNameValid;

  const setCategoryInputByFilter = (): void => {
    if (productsFilter.categoryId) {
      const currentSelectedCategory = categoryItems.find(c => c.id === productsFilter.categoryId);
      if (currentSelectedCategory) {
        setCategoryId(currentSelectedCategory.id);
        setCategoryNameInputValue(currentSelectedCategory.name);
      }
    } else {
      setCategoryId(0);
      setCategoryNameInputValue('');
    }
  };

  const setCategoryInputByFilterMemo = useCallback(setCategoryInputByFilter, [
    productsFilter.categoryId,
    categoryItems,
    setCategoryId,
    setCategoryNameInputValue,
  ]);

  useEffect(() => {
    setCategoryInputByFilterMemo();
  }, [
    setCategoryInputByFilterMemo,
    productsFilter.categoryId,
    categoryItems,
    setCategoryId,
    setCategoryNameInputValue,
  ]);

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

  const handleAddButtonClick = async (): Promise<void> => {
    const { type: createProductActionType } = await createProduct({
      name: productNameInputValue.trim(),
      caloriesCost,
      categoryId,
    });

    if (createProductActionType === ProductsOperationsActionTypes.CreateSuccess) {
      setProductNameInputValue('');
      setCaloriesCost(100);
      setCategoryInputByFilter();
      await getProducts(productsFilter);
      await getCategories();
    }
  };

  return (
    <div className="product-input">
      <div className="product-input__name">
        <FormGroup>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="New product name"
            value={productNameInputValue}
            onChange={handleProductNameChange}
            disabled={isInputDisabled}
          ></Input>
        </FormGroup>
      </div>
      <div className="product-input__calories">
        <FormGroup>
          <Label>Calories cost</Label>
          <Input
            type="number"
            placeholder="Calories per 100g"
            value={caloriesCost}
            onChange={handleCaloriesCostChange}
            disabled={isInputDisabled}
          ></Input>
        </FormGroup>
      </div>
      <div className="product-input__category">
        <FormGroup>
          <Label>Category</Label>
          <DropdownList
            items={categoryDropdownItems}
            itemRenderer={categoryDropdownItemRenderer}
            placeholder="Select category"
            searchable={true}
            inputValue={categoryNameInputValue}
            isContentLoading={isCategoryDropdownContentLoading}
            contentLoadingMessage={categoryDropdownContentLoadingMessage}
            contentErrorMessage={categoryDropdownContentErrorMessage}
            disabled={isInputDisabled}
            onValueSelect={handleCategoryDropdownItemSelect}
            onInputValueChange={handleCategoryNameDropdownInputChange}
            onContentOpen={handleCategoryDropdownContentOpen}
          ></DropdownList>
        </FormGroup>
      </div>
      <div className="product-input__add">
        <Button onClick={handleAddButtonClick} disabled={isAddButtonDisabled}>
          Add
        </Button>
      </div>
      {isOperationInProcess && (
        <div className="product-input__loader">
          <Loader size="small" label={operationMessage}></Loader>
        </div>
      )}
    </div>
  );
};

export default ProductInput;
