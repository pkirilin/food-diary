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

  // Removes redundant request (without category filter) inside ProductsTable component
  // by simply not allowing it to render and perform any action if category is unknown
  if (productsFilter.categoryId === undefined) {
    return null;
  }

  return (
    <React.Fragment>
      <SectionTitle title="Categories"></SectionTitle>
      <ProductInputConnected></ProductInputConnected>
      <ProductsTableConnected></ProductsTableConnected>
    </React.Fragment>
  );
};

export default CategoryContent;
