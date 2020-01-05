import React from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';

const Products: React.FC = () => {
  return (
    <ContentWrapper>
      <MainContainer>
        <SectionContainer>Products content</SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
