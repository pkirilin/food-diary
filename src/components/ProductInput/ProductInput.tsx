import React from 'react';
import './ProductInput.scss';
import { FormGroup, Input, Label, Button } from '../Controls';
import Loader from '../Loader';

type ProductInputProps = {};

const ProductInput: React.FC<ProductInputProps> = () => {
  const isProductInputLoaderVisible = false;
  const operationMessage = 'Some operation';

  return (
    <div className="product-input">
      <FormGroup>
        <Label>Name</Label>
        <Input type="text" placeholder="Product name"></Input>
      </FormGroup>
      <FormGroup>
        <Label>Calories</Label>
        <Input type="number" placeholder="Calories cost per 100g"></Input>
      </FormGroup>
      <div className="product-input__add">
        <Button>Add</Button>
      </div>
      {isProductInputLoaderVisible && (
        <div className="product-input__loader">
          <Loader size="small" label={operationMessage}></Loader>
        </div>
      )}
    </div>
  );
};

export default ProductInput;
