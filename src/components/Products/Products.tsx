import React from 'react';
import './Products.scss';
import { FDContent, FDContentWrapper, FDMainContainer } from '../Layout';

const Products: React.FC = () => {
  return (
    <FDContentWrapper>
      <FDMainContainer>
        <FDContent>Products content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Products;
