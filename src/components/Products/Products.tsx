import React, { useEffect } from 'react';
import ProductsTableConnected from '../ProductsTable';
import { ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult } from './ProductsConnected';
import { Container } from '../__ui__';
import ProductsControlPanelConnected from '../ProductsControlPanel';
import ProductsFilterInfoConnected from '../ProductsFilterInfo';
import { useModalMessage } from '../../hooks';

interface ProductsProps extends ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult {}

const Products: React.FC<ProductsProps> = ({ clearProductsFilter }: ProductsProps) => {
  useEffect(() => {
    return (): void => {
      clearProductsFilter();
    };
  }, [clearProductsFilter]);

  useModalMessage('Error', state => state.products.operations.productOperationStatus.error);

  return (
    <main>
      <section>
        <Container direction="column" spaceBetweenChildren="medium">
          <Container direction="column" spaceBetweenChildren="large">
            <ProductsControlPanelConnected></ProductsControlPanelConnected>
            <ProductsFilterInfoConnected></ProductsFilterInfoConnected>
          </Container>
          <ProductsTableConnected></ProductsTableConnected>
        </Container>
      </section>
    </main>
  );
};

export default Products;
