import {
  type EditProductRequest,
  type CreateProductRequest,
  type productModel,
} from '@/entities/product';

export const mapToCreateProductRequest = (
  categoryId: number,
  {
    name,
    caloriesCost,
    defaultQuantity,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

export const mapToEditProductRequest = (
  id: number,
  categoryId: number,
  {
    name,
    caloriesCost,
    defaultQuantity,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): EditProductRequest => ({
  id,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
