import React, { useState, useEffect, useCallback } from 'react';
import './ProductInput.scss';
import { ProductInputStateToPropsMapResult, ProductInputDispatchToPropsMapResult } from './ProductInputConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useDebounce, useProductValidation, useFocus } from '../../hooks';
import { Input, Label, Button, DropdownList, categoryDropdownItemRenderer, Container } from '../__ui__';
import { ProductItem } from '../../models';

const emptyProduct: ProductItem = {
  id: 0,
  name: '',
  caloriesCost: 100,
  categoryId: 0,
  categoryName: '',
};

interface ProductInputProps extends ProductInputStateToPropsMapResult, ProductInputDispatchToPropsMapResult {
  refreshCategoriesOnCreateProduct?: boolean;
  product?: ProductItem;
}

const ProductInput: React.FC<ProductInputProps> = ({
  refreshCategoriesOnCreateProduct = false,
  product = emptyProduct,
  categoryItems,
  categoryDropdownItems,
  categoryDropdownItemsFetchState,
  productsFilter,
  createProduct,
  editProduct,
  getProducts,
  getCategoryDropdownItems,
  getCategories,
  closeModal,
}: ProductInputProps) => {
  const [productNameInputValue, setProductNameInputValue] = useState(product.name);
  const [caloriesCost, setCaloriesCost] = useState(product.caloriesCost);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [categoryNameInputValue, setCategoryNameInputValue] = useState(product.categoryName);
  const elementToFocusRef = useFocus<HTMLInputElement>();

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

  const isSubmitButtonDisabled = !isProductNameValid || !isCaloriesCostValid || !isCategoryNameValid;
  const isProductEditable = product !== emptyProduct;

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
    if (!isProductEditable) {
      setCategoryInputByFilterMemo();
    }
  }, [
    setCategoryInputByFilterMemo,
    productsFilter.categoryId,
    categoryItems,
    setCategoryId,
    setCategoryNameInputValue,
    isProductEditable,
  ]);

  const categoryNameChangeDebounce = useDebounce((newCategoryName?: string) => {
    getCategoryDropdownItems({
      categoryNameFilter: newCategoryName,
    });
  });

  const refreshProductsAsync = async (): Promise<void> => {
    await getProducts(productsFilter);
    if (refreshCategoriesOnCreateProduct) {
      await getCategories();
    }
  };

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
    closeModal();

    const { type: createProductActionType } = await createProduct({
      name: productNameInputValue.trim(),
      caloriesCost,
      categoryId,
    });

    if (createProductActionType === ProductsOperationsActionTypes.CreateSuccess) {
      await refreshProductsAsync();
    }
  };

  const handleEditButtonClick = async (): Promise<void> => {
    closeModal();

    const { type: editProductActionType } = await editProduct({
      id: product.id,
      product: {
        name: productNameInputValue.trim(),
        caloriesCost,
        categoryId,
      },
    });

    if (editProductActionType === ProductsOperationsActionTypes.EditSuccess) {
      await refreshProductsAsync();
    }
  };

  const handleCancelButtonClick = (): void => {
    closeModal();
  };

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <Container col="3" direction="column">
        <Label>Name</Label>
        <Input
          type="text"
          placeholder="Product name"
          value={productNameInputValue}
          onChange={handleProductNameChange}
        ></Input>
      </Container>
      <Container col="2" direction="column">
        <Label>Calories cost</Label>
        <Input
          type="number"
          placeholder="Calories per 100g"
          value={caloriesCost}
          onChange={handleCaloriesCostChange}
        ></Input>
      </Container>
      <Container col="3" direction="column">
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
          onValueSelect={handleCategoryDropdownItemSelect}
          onInputValueChange={handleCategoryNameDropdownInputChange}
          onContentOpen={handleCategoryDropdownContentOpen}
        ></DropdownList>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          {isProductEditable ? (
            <Button onClick={handleEditButtonClick} disabled={isSubmitButtonDisabled}>
              Save
            </Button>
          ) : (
            <Button onClick={handleAddButtonClick} disabled={isSubmitButtonDisabled}>
              Add
            </Button>
          )}
        </Container>
        <Container col="4">
          <Button inputRef={elementToFocusRef} variant="text" onClick={handleCancelButtonClick}>
            Cancel
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

export default ProductInput;
