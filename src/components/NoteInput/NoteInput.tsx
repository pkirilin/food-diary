import React, { useState } from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, DropdownList, DropdownItem, Button } from '../Controls';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NoteInputConnected';
import { MealType } from '../../models';
import { useParams } from 'react-router-dom';
import Loader from '../Loader';
import { NotesOperationsActionTypes } from '../../action-types';

interface NoteInputProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  mealType: MealType;
}

const NoteInput: React.FC<NoteInputProps> = ({
  mealType,
  mealOperationStatuses,
  notesForMealFetchStates,
  createNote,
  getNotesForMeal,
}: NoteInputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState(100);

  const { id: pageIdFromParams } = useParams();

  const currentMealOperationStatus = mealOperationStatuses.filter(s => s.mealType === mealType)[0];
  const currentMealFetchState = notesForMealFetchStates.filter(s => s.mealType === mealType)[0];

  const isOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const isInputDisabled = isOperationInProcess || isNotesTableLoading;

  const operationMessage = currentMealOperationStatus ? currentMealOperationStatus.message : '';

  const handleProductValueChange = (newSelectedValue: string): void => {
    setProductName(newSelectedValue);
  };

  const handleQuantityValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleAddButtonClick = async (): Promise<void> => {
    const pageId = pageIdFromParams && !isNaN(+pageIdFromParams) ? +pageIdFromParams : 0;

    // TODO: take product id from store
    const createNoteAction = await createNote({
      id: 0,
      mealType,
      productId: 0,
      productQuantity,
      pageId,
    });

    if (createNoteAction.type === NotesOperationsActionTypes.CreateSuccess) {
      await getNotesForMeal({
        pageId,
        mealType,
      });
    }
  };

  return (
    <div className="note-input">
      <div className="note-input__product">
        <FormGroup>
          <Label>Product</Label>
          <DropdownList placeholder="Select product" onValueChanged={handleProductValueChange}>
            <DropdownItem>Product 1</DropdownItem>
            <DropdownItem>Product 2</DropdownItem>
          </DropdownList>
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
        <Button onClick={handleAddButtonClick} disabled={isInputDisabled}>
          Add
        </Button>
      </div>
      {isOperationInProcess && (
        <div className="note-input__loader">
          <Loader size="small" label={operationMessage}></Loader>
        </div>
      )}
    </div>
  );
};

export default NoteInput;
