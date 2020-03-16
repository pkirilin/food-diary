import React from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import ProductsTableConnected from '../ProductsTable';
import Pagination from '../Pagination';

const Products: React.FC = () => {
  return (
    <ContentWrapper>
      <MainContainer>
        <SectionContainer>
          <SectionTitle title="Products"></SectionTitle>
          <ProductInputConnected></ProductInputConnected>
          <ProductsTableConnected></ProductsTableConnected>
          <Pagination totalItemsCount={100} pageSize={10} maxVisiblePagesCount={5}></Pagination>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
