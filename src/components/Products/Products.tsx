import React, { useEffect, useState } from 'react';
import ProductsTableConnected from '../ProductsTable';
import { ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult } from './ProductsConnected';
import { ProductsFilter } from '../../models';
import { productsFilterInitialState } from '../../reducers/products';
import { Container } from '../__ui__';
import ProductsControlPanelConnected from '../ProductsControlPanel';
import ProductsFilterInfoConnected from '../ProductsFilterInfo';
import { useModalMessage } from '../../hooks';

interface ProductsProps extends ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult {}

const Products: React.FC<ProductsProps> = ({ productsFilter, clearProductsFilter }: ProductsProps) => {
  const [isFilterCleared, setIsFilterCleared] = useState(false);

  useEffect(() => {
    const isDefaultProductsFilter = ({ pageSize, pageNumber, categoryId }: ProductsFilter): boolean => {
      return (
        pageSize === productsFilterInitialState.params.pageSize &&
        pageNumber === productsFilterInitialState.params.pageNumber &&
        categoryId === productsFilterInitialState.params.categoryId
      );
    };

    if (isDefaultProductsFilter(productsFilter)) {
      setIsFilterCleared(true);
    }
  }, [productsFilter, setIsFilterCleared]);

  useEffect(() => {
    return (): void => {
      clearProductsFilter();
    };
  }, [clearProductsFilter]);

  useModalMessage('Error', state => state.products.operations.productOperationStatus.error);

  return (
    <main>
      <section>
        {/* Ensures that products table in this section is initially rendered with cleared filter */}
        {isFilterCleared && (
          <Container direction="column" spaceBetweenChildren="medium">
            <Container direction="column" spaceBetweenChildren="large">
              <ProductsControlPanelConnected></ProductsControlPanelConnected>
              <ProductsFilterInfoConnected></ProductsFilterInfoConnected>
            </Container>
            <ProductsTableConnected></ProductsTableConnected>
          </Container>
        )}
      </section>
    </main>
  );
};

export default Products;
