import React, { useState } from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, Button, productDropdownItemRenderer, DropdownList } from '../Controls';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NoteInputConnected';
import { MealType } from '../../models';
import { useParams } from 'react-router-dom';
import Loader from '../Loader';
import { NotesOperationsActionTypes } from '../../action-types';
import { useDebounce } from '../../hooks';

interface NoteInputProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  mealType: MealType;
}

const NoteInput: React.FC<NoteInputProps> = ({
  mealType,
  mealOperationStatuses,
  notesForMealFetchStates,
  productDropdownItems,
  isProductDropdownContentLoading,
  isPageOperationInProcess,
  createNote,
  getNotesForMeal,
  getProductDropdownItems,
}: NoteInputProps) => {
  const [productId, setProductId] = useState(0);
  const [productNameInputValue, setProductNameInputValue] = useState('');
  const [productQuantity, setProductQuantity] = useState(100);

  const productNameChangeDebounce = useDebounce(() => {
    getProductDropdownItems();
  });

  const { id: pageIdFromParams } = useParams();

  const currentMealOperationStatus = mealOperationStatuses.filter(s => s.mealType === mealType)[0];
  const currentMealFetchState = notesForMealFetchStates.filter(s => s.mealType === mealType)[0];
  const operationMessage = currentMealOperationStatus ? currentMealOperationStatus.message : '';

  const isMealOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const isInputDisabled = isMealOperationInProcess || isNotesTableLoading || isPageOperationInProcess;
  const isAddButtonDisabled = isInputDisabled || productNameInputValue === '' || isPageOperationInProcess;

  const handleProductDropdownItemSelect = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setProductNameInputValue(productDropdownItems[newSelectedProductIndex].name);
  };

  const handleProductNameDropdownInputChange = (newProductNameInputValue: string): void => {
    setProductNameInputValue(newProductNameInputValue);
    productNameChangeDebounce();
  };

  const handleQuantityValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleAddButtonClick = async (): Promise<void> => {
    const pageId = pageIdFromParams && !isNaN(+pageIdFromParams) ? +pageIdFromParams : 0;
    const createNoteAction = await createNote({
      id: 0,
      mealType,
      productId,
      productQuantity,
      pageId,
    });

    if (createNoteAction.type === NotesOperationsActionTypes.CreateSuccess) {
      await getNotesForMeal({
        pageId,
        mealType,
      });
      setProductNameInputValue('');
    }
  };

  const handleProductDropdownContentOpen = (): void => {
    getProductDropdownItems();
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
