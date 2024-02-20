import { type GetProductsRequest, type CreateProductRequest, type EditProductRequest } from './api';
import { type ProductItemsFilter } from './store';
import { type Product, type ProductFormData } from './types';

export const toProductFormData = ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  categoryName,
}: Product): ProductFormData => ({
  name,
  caloriesCost,
  defaultQuantity,
  category: {
    id: categoryId,
    name: categoryName,
  },
});

export const toGetProductsRequest = ({
  pageNumber,
  pageSize,
  productSearchName,
  category,
}: ProductItemsFilter): GetProductsRequest => ({
  pageNumber,
  pageSize,
  productSearchName,
  categoryId: category?.id,
});

export const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: ProductFormData): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id,
});

export const toEditProductRequest = (
  id: number,
  { name, caloriesCost, defaultQuantity, category }: ProductFormData,
): EditProductRequest => ({
  id,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category.id,
});
