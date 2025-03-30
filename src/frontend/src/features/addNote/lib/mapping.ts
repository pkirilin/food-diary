import {
  type GetProductByIdResponse,
  type CreateProductRequest,
  type EditProductRequest,
} from '@/entities/product';
import { type ProductFormValues } from '../model';

export const toCreateProductRequest = (
  { name, caloriesCost, defaultQuantity }: ProductFormValues,
  categoryId: number,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const toEditProductRequest = (
  { name, caloriesCost, defaultQuantity }: ProductFormValues,
  productId: number,
  categoryId: number,
): EditProductRequest => ({
  id: productId,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const toProductFormValues = (
  { name, defaultQuantity, caloriesCost, category }: GetProductByIdResponse,
  productId: number,
): ProductFormValues => ({
  id: productId,
  name,
  defaultQuantity,
  caloriesCost,
  category: {
    id: category.id,
    name: category.name,
  },
});
