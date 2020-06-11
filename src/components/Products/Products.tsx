import React, { useEffect, useState } from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import ProductsTableConnected from '../ProductsTable';
import { ProductsStateToPropsMapResult, ProductsDispatchToPropsMapResult } from './ProductsConnected';
import { ProductsFilter } from '../../models';
import { productsFilterInitialState } from '../../reducers/products';

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
    <ContentWrapper>
      <MainContainer>
        <SectionContainer>
          {/* Ensures that products table in this section is initially rendered with cleared filter */}
          {isFilterCleared && (
            <React.Fragment>
              <h1>Products</h1>
              <ProductInputConnected></ProductInputConnected>
              <ProductsTableConnected></ProductsTableConnected>
            </React.Fragment>
          )}
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
