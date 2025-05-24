import {
  type EditProductRequest,
  type CreateProductRequest,
  type productModel,
} from '@/entities/product';

export const mapToCreateProductRequest = (
  categoryId: number,
  { name, caloriesCost, defaultQuantity, protein }: productModel.ProductFormValues,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
});

export const mapToEditProductRequest = (
  id: number,
  categoryId: number,
  { name, caloriesCost, defaultQuantity, protein }: productModel.ProductFormValues,
): EditProductRequest => ({
  id,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
});
