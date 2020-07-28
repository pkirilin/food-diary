import React from 'react';
import { Container, Button, Loader, Icon } from '../__ui__';
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
  isProductsFilterChanged,
  openModal,
  clearProductsFilter,
}: ProductsControlPanelProps) => {
  const { performing: isOperationInProcess, message: operationMessage } = productOperationStatus;
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

  const handleClearProductsFilterClick = (): void => {
    clearProductsFilter();
  };

  return (
    <Container justify="space-between">
      <Container col="9" spaceBetweenChildren="large">
        <Container col="3">
          <Button onClick={handleAddProductClick} disabled={isOperationInProcess || isProductsTableLoading}>
            Add product
          </Button>
        </Container>
        <Container col="3" justify="center">
          <Icon type="filter" label="Filter products" onClick={handleOpenProductsFilterClick}></Icon>
        </Container>
        <Container col="3" justify="center">
          <Icon
            type="close"
            label="Clear filter"
            disabled={!isProductsFilterChanged}
            onClick={handleClearProductsFilterClick}
          ></Icon>
        </Container>
      </Container>
      <Container col="3" justify="center">
        {isOperationInProcess && <Loader size="small" label={operationMessage}></Loader>}
      </Container>
    </Container>
  );
};

export default ProductsControlPanel;
