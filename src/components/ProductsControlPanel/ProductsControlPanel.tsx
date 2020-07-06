import React from 'react';
import { Container, Button, Loader } from '../__ui__';
import {
  ProductsControlPanelStateToPropsMapResult,
  ProductsControlPanelDispatchToPropsMapResult,
} from './ProductsControlPanelConnected';
import ProductInputConnected from '../ProductInput';

interface ProductsControlPanelProps
  extends ProductsControlPanelStateToPropsMapResult,
    ProductsControlPanelDispatchToPropsMapResult {}

const ProductsControlPanel: React.FC<ProductsControlPanelProps> = ({
  productOperationStatus,
  productItemsFetchState,
  openModal,
}: ProductsControlPanelProps) => {
  const { performing: isOperationInProcess, message: operationMessage } = productOperationStatus;
  const { loading: isProductsTableLoading } = productItemsFetchState;

  const handleAddProductClick = (): void => {
    openModal('New product', <ProductInputConnected></ProductInputConnected>, {
      width: '35%',
    });
  };

  return (
    <Container justify="space-between">
      <Container col="3">
        <Button onClick={handleAddProductClick} disabled={isOperationInProcess || isProductsTableLoading}>
          Add product
        </Button>
      </Container>
      <Container col="3" justify="center">
        {isOperationInProcess && <Loader size="small" label={operationMessage}></Loader>}
      </Container>
    </Container>
  );
};

export default ProductsControlPanel;
