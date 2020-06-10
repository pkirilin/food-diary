import React, { useState } from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, Button, productDropdownItemRenderer, DropdownList } from '../Controls';
import { NoteInputStateToPropsMapResult, NoteInputDispatchToPropsMapResult } from './NoteInputConnected';
import { MealType } from '../../models';
import { NotesOperationsActionTypes } from '../../action-types';
import { useDebounce, useNoteValidation, useIdFromRoute } from '../../hooks';
import { Loader } from '../__ui__';

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
    <div className="note-input">
      <div className="note-input__product">
        <FormGroup>
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
        </FormGroup>
      </div>
      <div className="note-input__quantity">
        <FormGroup>
          <Label>Quantity, g</Label>
          <Input
            type="number"
            placeholder="Enter quantity"
            value={productQuantity}
            onChange={handleQuantityValueChange}
            disabled={isInputDisabled}
          ></Input>
        </FormGroup>
      </div>
      <div className="note-input__add">
        <Button onClick={handleAddButtonClick} disabled={isAddButtonDisabled}>
          Add
        </Button>
      </div>
      {isMealOperationInProcess && (
        <div className="note-input__loader">
          <Loader size="small" label={operationMessage}></Loader>
        </div>
      )}
    </div>
  );
};

export default NoteInput;
