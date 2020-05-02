import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductsTableConnected from '../ProductsTable';
import {
  CategoryContentStateToPropsMapResult,
  CategoryContentDispatchToPropsMapResult,
} from './CategoryContentConnected';
import { SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';

interface CategoryContentProps extends CategoryContentStateToPropsMapResult, CategoryContentDispatchToPropsMapResult {}

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

  // Removes redundant requests inside ProductsTable component
  // by simply not allowing it to render and perform any action if category is unknown
  if (productsFilter.categoryId === undefined || productsFilter.categoryId !== categoryId) {
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
