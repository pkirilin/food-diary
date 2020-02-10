import React from 'react';
import './NoteInput.scss';
import { FormGroup, Label, Input, DropdownList, DropdownItem, Button } from '../Controls';

type NoteInputProps = {};

const NoteInput: React.FC<NoteInputProps> = () => {
  return (
    <div className="note-input">
      <div className="note-input__product">
        <FormGroup>
          <Label>Product</Label>
          <DropdownList placeholder="Select product">
            <DropdownItem>Product 1</DropdownItem>
            <DropdownItem>Product 2</DropdownItem>
          </DropdownList>
        </FormGroup>
      </div>
      <div className="note-input__quantity">
        <FormGroup>
          <Label>Quantity, g</Label>
          <Input type="number" placeholder="Enter quantity"></Input>
        </FormGroup>
      </div>
      <div className="note-input__add">
        <Button>Add</Button>
      </div>
    </div>
  );
};

export default NoteInput;
