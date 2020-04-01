import React from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import ProductsTableConnected from '../ProductsTable';

const Products: React.FC = () => {
  return (
    <ContentWrapper>
      <MainContainer>
        <SectionContainer>
          <SectionTitle title="Products"></SectionTitle>
          <ProductInputConnected></ProductInputConnected>
          <ProductsTableConnected></ProductsTableConnected>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
