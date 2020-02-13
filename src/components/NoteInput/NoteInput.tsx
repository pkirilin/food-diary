import React, { useState } from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, DropdownList, DropdownItem, Button } from '../Controls';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NoteInputConnected';
import { MealType } from '../../models';
import { useParams } from 'react-router-dom';
import Loader from '../Loader';

interface NoteInputProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  mealType: MealType;
}

const NoteInput: React.FC<NoteInputProps> = ({
  mealType,
  createNote,
  isOperationInProcess,
  operationMessage = '',
}: NoteInputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState(100);

  const { id: pageId } = useParams();

  const handleProductValueChange = (newSelectedValue: string): void => {
    setProductName(newSelectedValue);
  };

  const handleQuantityValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleAddButtonClick = (): void => {
    // TODO: take product id from store
    createNote({
      id: 0,
      mealType,
      productId: 0,
      productQuantity,
      pageId: pageId && !isNaN(+pageId) ? +pageId : 0,
    });
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
            disabled={isOperationInProcess}
          ></Input>
        </FormGroup>
      </div>
      <div className="note-input__add">
        <Button onClick={handleAddButtonClick} disabled={isOperationInProcess}>
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
