import { type NoteRequestBody } from '@/entities/note';
import {
  type GetProductByIdResponse,
  type CreateProductRequest,
  type EditProductRequest,
} from '@/entities/product';
import { type NoteFormValuesProduct, type NoteFormValues, type ProductFormValues } from '../model';

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

export const toNoteRequestBody = (
  { date, mealType, displayOrder, quantity }: NoteFormValues,
  product: NoteFormValuesProduct,
): NoteRequestBody => ({
  date,
  mealType,
  displayOrder,
  productId: product.id,
  productQuantity: quantity,
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
