import React from 'react';
import {
  ProductsFilterInfoStateToPropsMapResult,
  ProductsFilterInfoDispatchToPropsMapResult,
} from './ProductsFilterInfoConnected';
import { Icon, Container } from '../__ui__';

interface ProductsFilterInfoProps
  extends ProductsFilterInfoStateToPropsMapResult,
    ProductsFilterInfoDispatchToPropsMapResult {}

const ProductsFilterInfo: React.FC<ProductsFilterInfoProps> = ({
  productsFilter,
  updateProductsFilter,
}: ProductsFilterInfoProps) => {
  const { productName } = productsFilter;

  if (!productName) {
    return null;
  }

  const handleResetFilterByNameClick = (): void => {
    updateProductsFilter({
      ...productsFilter,
      productName: '',
    });
  };

  return (
    <Container spaceBetweenChildren="medium">
      <span>Showing products by name: {productName}</span>
      <Icon type="close" size="small" title="Reset filter by name" onClick={handleResetFilterByNameClick}></Icon>
    </Container>
  );
};

export default ProductsFilterInfo;
