import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Container } from '../__ui__';
import { useModalMessage } from '../../hooks';
import { clearProductsFilter } from '../../action-creators';
import ProductsTableConnected from '../ProductsTable';
import ProductsControlPanelConnected from '../ProductsControlPanel';
import ProductsFilterInfoConnected from '../ProductsFilterInfo';

const Products: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    return (): void => {
      dispatch(clearProductsFilter());
    };
  }, [dispatch]);

  useModalMessage('Error', state => state.products.operations.productOperationStatus.error);

  return (
    <main>
      <section>
        <Container direction="column" spaceBetweenChildren="medium">
          <Container justify="space-between" align="center" spaceBetweenChildren="medium">
            <h1>Products</h1>
            <ProductsControlPanelConnected></ProductsControlPanelConnected>
          </Container>
          <ProductsFilterInfoConnected></ProductsFilterInfoConnected>
          <ProductsTableConnected></ProductsTableConnected>
        </Container>
      </section>
    </main>
  );
};

export default Products;
