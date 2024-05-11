import {
  type EditProductRequest,
  type CreateProductRequest,
  type productModel,
} from '@/entities/product';

export const mapToCreateProductRequest = (
  categoryId: number,
  { name, caloriesCost, defaultQuantity }: productModel.FormValues,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const mapToEditProductRequest = (
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
