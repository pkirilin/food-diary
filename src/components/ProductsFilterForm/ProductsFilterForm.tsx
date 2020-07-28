import React, { useState, useEffect } from 'react';
import { Container, Label, Input, Button } from '../__ui__';
import {
  ProductsFilterFormStateToPropsMapResult,
  ProductsFilterFormDispatchToPropsMapResult,
} from './ProductsFilterFormConnected';
import { useFocus } from '../../hooks';

interface ProductsFilterFormProps
  extends ProductsFilterFormStateToPropsMapResult,
    ProductsFilterFormDispatchToPropsMapResult {}

const ProductsFilterForm: React.FC<ProductsFilterFormProps> = ({
  productsFilter,
  closeModal,
  updateProductsFilter,
}: ProductsFilterFormProps) => {
  const [productName, setProductName] = useState('');
  const elementToFocusRef = useFocus<HTMLInputElement>();

  useEffect(() => {
    if (productsFilter.productName) {
      setProductName(productsFilter.productName);
    }
  }, [productsFilter]);

  const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setProductName(event.target.value);
  };

  const handleApplyClick = (): void => {
    closeModal();
    updateProductsFilter({
      ...productsFilter,
      productName,
      pageNumber: undefined,
    });
  };

  const handleCancelClick = (): void => {
    closeModal();
  };

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <Container>
        <Container col="12" direction="column">
          <Label>Product name</Label>
          <Input
            inputRef={elementToFocusRef}
            value={productName}
            onChange={handleProductNameChange}
            placeholder="Filter by product name"
          ></Input>
        </Container>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button onClick={handleApplyClick}>Apply</Button>
        </Container>
        <Container col="4">
          <Button variant="text" onClick={handleCancelClick}>
            Cancel
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

export default ProductsFilterForm;
