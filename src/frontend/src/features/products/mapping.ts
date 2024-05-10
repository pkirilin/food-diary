import {
  type GetProductsRequest,
  type CreateProductRequest,
  type EditProductRequest,
  type productModel,
} from '@/entities/product';
import { type ProductItemsFilter } from './store';
import { type Product } from './types';

export const toProductFormData = ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  categoryName,
}: Product): productModel.FormValues => ({
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

export const toCreateProductRequest = (
  categoryId: number,
  { name, caloriesCost, defaultQuantity }: productModel.FormValues,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const toEditProductRequest = (
  id: number,
  categoryId: number,
  { name, caloriesCost, defaultQuantity }: productModel.FormValues,
): EditProductRequest => ({
  id,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});
