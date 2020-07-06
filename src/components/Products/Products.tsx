import React, { useEffect, useState } from 'react';
import ProductsTableConnected from '../ProductsTable';
import { ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult } from './ProductsConnected';
import { ProductsFilter } from '../../models';
import { productsFilterInitialState } from '../../reducers/products';
import { Container } from '../__ui__';
import ProductsControlPanelConnected from '../ProductsControlPanel';

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

  return (
    <main>
      <section>
        {/* Ensures that products table in this section is initially rendered with cleared filter */}
        {isFilterCleared && (
          <Container direction="column" spaceBetweenChildren="medium">
            <ProductsControlPanelConnected></ProductsControlPanelConnected>
            <ProductsTableConnected></ProductsTableConnected>
          </Container>
        )}
      </section>
    </main>
  );
};

export default Products;
