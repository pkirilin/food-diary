import React, { useState } from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, DropdownList, Button, productDropdownItemRenderer } from '../Controls';
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
  productDropdownItems,
  createNote,
  getNotesForMeal,
}: NoteInputProps) => {
  const [productId, setProductId] = useState(0);
  const [productQuantity, setProductQuantity] = useState(100);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);

  const { id: pageIdFromParams } = useParams();

  const currentMealOperationStatus = mealOperationStatuses.filter(s => s.mealType === mealType)[0];
  const currentMealFetchState = notesForMealFetchStates.filter(s => s.mealType === mealType)[0];
  const operationMessage = currentMealOperationStatus ? currentMealOperationStatus.message : '';

  const isOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const isInputDisabled = isOperationInProcess || isNotesTableLoading;
  const isAddButtonDisabled = isInputDisabled || selectedProductIndex < 1;

  const handleProductDropdownItemChange = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setSelectedProductIndex(newSelectedProductIndex);
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
      setSelectedProductIndex(-1);
    }
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
            onValueChange={handleProductDropdownItemChange}
            selectedValueIndex={selectedProductIndex}
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
      {isOperationInProcess && (
        <div className="note-input__loader">
          <Loader size="small" label={operationMessage}></Loader>
        </div>
      )}
    </div>
  );
};

export default NoteInput;
