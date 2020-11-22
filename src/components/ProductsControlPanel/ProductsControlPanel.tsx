import React from 'react';
import { Container, Button, Icon } from '../__ui__';
import {
  ProductsControlPanelStateToPropsMapResult,
  ProductsControlPanelDispatchToPropsMapResult,
} from './ProductsControlPanelConnected';
import ProductInputConnected from '../ProductInput';
import ProductsFilterFormConnected from '../ProductsFilterForm';

interface ProductsControlPanelProps
  extends ProductsControlPanelStateToPropsMapResult,
    ProductsControlPanelDispatchToPropsMapResult {}

const ProductsControlPanel: React.FC<ProductsControlPanelProps> = ({
  productOperationStatus,
  productItemsFetchState,
  openModal,
}: ProductsControlPanelProps) => {
  const { performing: isOperationInProcess } = productOperationStatus;
  const { loading: isProductsTableLoading } = productItemsFetchState;

  const handleAddProductClick = (): void => {
    openModal('New product', <ProductInputConnected></ProductInputConnected>, {
      width: '35%',
    });
  };

  const handleOpenProductsFilterClick = (): void => {
    openModal('Products filter', <ProductsFilterFormConnected></ProductsFilterFormConnected>, {
      width: '35%',
    });
  };

  return (
    <Container justify="space-between" spaceBetweenChildren="large">
      <Icon type="filter" label="Filter" onClick={handleOpenProductsFilterClick}></Icon>
      <Container>
        <Button onClick={handleAddProductClick} disabled={isOperationInProcess || isProductsTableLoading}>
          Create product
        </Button>
      </Container>
    </Container>
  );
};

export default ProductsControlPanel;
