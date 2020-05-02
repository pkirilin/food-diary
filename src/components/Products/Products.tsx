import React, { useEffect, useState } from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionTitle } from '../ContainerBlocks';
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
        pageSize === productsFilterInitialState.pageSize &&
        pageNumber === productsFilterInitialState.pageNumber &&
        categoryId === productsFilterInitialState.categoryId
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
              <SectionTitle title="Products"></SectionTitle>
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
