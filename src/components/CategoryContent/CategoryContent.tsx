import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductsTableConnected from '../ProductsTable';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoryContentConnected';
import { SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';

interface CategoryContentProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const CategoryContent: React.FC<CategoryContentProps> = ({
  productsFilter,
  updateProductsFilter,
}: CategoryContentProps) => {
  const { id: categoryIdFromRoute } = useParams();
  const categoryId: number | undefined = categoryIdFromRoute
    ? !isNaN(+categoryIdFromRoute)
      ? +categoryIdFromRoute
      : undefined
    : undefined;

  useEffect(() => {
    if (productsFilter.categoryId !== categoryId) {
      updateProductsFilter({
        ...productsFilter,
        categoryId,
      });
    }
  }, [updateProductsFilter, productsFilter, categoryId]);

  return (
    <React.Fragment>
      <SectionTitle title="Products"></SectionTitle>
      <ProductInputConnected></ProductInputConnected>
      <ProductsTableConnected></ProductsTableConnected>
    </React.Fragment>
  );
};

export default CategoryContent;
