import React, { useState } from 'react';
import './NoteInput.scss';
import { NoteInputStateToPropsMapResult, NoteInputDispatchToPropsMapResult } from './NoteInputConnected';
import { MealType } from '../../models';
import { NotesOperationsActionTypes } from '../../action-types';
import { useDebounce, useNoteValidation, useIdFromRoute } from '../../hooks';
import { Loader, Label, Input, Button, productDropdownItemRenderer, DropdownList, Container } from '../__ui__';

interface NoteInputProps extends NoteInputStateToPropsMapResult, NoteInputDispatchToPropsMapResult {
  mealType: MealType;
}

const NoteInput: React.FC<NoteInputProps> = ({
  mealType,
  mealOperationStatuses,
  notesForMealFetchStates,
  productDropdownItems,
  noteItems,
  productDropdownItemsFetchState,
  isPageOperationInProcess,
  pagesFilter,
  createNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
}: NoteInputProps) => {
  const [productId, setProductId] = useState(0);
  const [productNameInputValue, setProductNameInputValue] = useState('');
  const [productQuantity, setProductQuantity] = useState(100);
  const [isProductNameValid, isProductQuantityValid] = useNoteValidation(productNameInputValue, productQuantity);

  const productNameChangeDebounce = useDebounce((newProductName?: string) => {
    getProductDropdownItems({
      productNameFilter: newProductName,
    });
  });

  const pageId = useIdFromRoute();

  const currentMealOperationStatus = mealOperationStatuses.find(s => s.mealType === mealType);
  const currentMealFetchState = notesForMealFetchStates.find(s => s.mealType === mealType);

  const operationMessage = currentMealOperationStatus ? currentMealOperationStatus.message : '';

  const {
    loading: isProductDropdownContentLoading,
    loadingMessage: productDropdownContentLoadingMessage,
    error: productDropdownContentErrorMessage,
  } = productDropdownItemsFetchState;

  const isMealOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const isInputDisabled = isMealOperationInProcess || isNotesTableLoading || isPageOperationInProcess;
  const isAddButtonDisabled = isInputDisabled || !isProductNameValid || !isProductQuantityValid;

  const handleProductDropdownItemSelect = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setProductNameInputValue(productDropdownItems[newSelectedProductIndex].name);
  };

  const handleProductNameDropdownInputChange = (newProductNameInputValue: string): void => {
    setProductNameInputValue(newProductNameInputValue);
    productNameChangeDebounce(newProductNameInputValue);
  };

  const handleQuantityValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleAddButtonClick = async (): Promise<void> => {
    const noteItemsForThisMeal = noteItems.filter(n => n.mealType === mealType);
    const lastNoteDisplayOrder =
      noteItemsForThisMeal.length > 0 ? noteItemsForThisMeal[noteItemsForThisMeal.length - 1].displayOrder : -1;

    const createNoteAction = await createNote({
      mealType,
      productId,
      productQuantity,
      pageId,
      displayOrder: lastNoteDisplayOrder + 1,
    });

    if (createNoteAction.type === NotesOperationsActionTypes.CreateSuccess) {
      setProductNameInputValue('');
      setProductQuantity(100);
      await getNotesForMeal({
        pageId,
        mealType,
      });
      await getPages(pagesFilter);
    }
  };

  const handleProductDropdownContentOpen = (): void => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
  };

  return (
    <Container col="12" align="flex-end" spaceBetweenChildren="medium">
      <Container col="4" direction="column">
        <Label>Product</Label>
        <DropdownList
          items={productDropdownItems}
          itemRenderer={productDropdownItemRenderer}
          placeholder="Select product"
          searchable={true}
          inputValue={productNameInputValue}
          isContentLoading={isProductDropdownContentLoading}
          contentLoadingMessage={productDropdownContentLoadingMessage}
          contentErrorMessage={productDropdownContentErrorMessage}
          disabled={isInputDisabled}
          onValueSelect={handleProductDropdownItemSelect}
          onInputValueChange={handleProductNameDropdownInputChange}
          onContentOpen={handleProductDropdownContentOpen}
        ></DropdownList>
      </Container>
      <Container col="2" direction="column">
        <Label>Quantity, g</Label>
        <Input
          type="number"
          placeholder="Enter quantity"
          value={productQuantity}
          onChange={handleQuantityValueChange}
          disabled={isInputDisabled}
        ></Input>
      </Container>
      <Container col="6">
        <Container col="12" justify="space-between">
          <Container col="4">
            <Button onClick={handleAddButtonClick} disabled={isAddButtonDisabled}>
              Add
            </Button>
          </Container>
          {isMealOperationInProcess && (
            <Container col="6">
              <Loader size="small" label={operationMessage}></Loader>
            </Container>
          )}
        </Container>
      </Container>
    </Container>
  );
};

export default NoteInput;
