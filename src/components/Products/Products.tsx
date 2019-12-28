import React from 'react';
import './Products.scss';
import FDContentWrapper from '../Layout/FDContentWrapper';
import FDMainContainer from '../Layout/FDMainContainer';
import FDContent from '../Layout/FDContent';

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
