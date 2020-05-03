import React, { useEffect } from 'react';
import ProductsTableConnected from '../ProductsTable';
import {
  CategoryContentStateToPropsMapResult,
  CategoryContentDispatchToPropsMapResult,
} from './CategoryContentConnected';
import { SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import { useIdFromRoute } from '../../hooks';

interface CategoryContentProps extends CategoryContentStateToPropsMapResult, CategoryContentDispatchToPropsMapResult {}

const CategoryContent: React.FC<CategoryContentProps> = ({
  productsFilter,
  updateProductsFilter,
}: CategoryContentProps) => {
  const categoryId = useIdFromRoute();

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
  if (!productsFilter.categoryId || productsFilter.categoryId !== categoryId) {
    return null;
  }

  return (
    <React.Fragment>
      <SectionTitle title="Categories"></SectionTitle>
      <ProductInputConnected refreshCategoriesOnCreateProduct={true}></ProductInputConnected>
      <ProductsTableConnected refreshCategoriesOnDeleteProduct={true}></ProductsTableConnected>
    </React.Fragment>
  );
};

export default CategoryContent;
