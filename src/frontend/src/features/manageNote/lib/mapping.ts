import { type productModel, type ProductSelectOption } from '@/entities/product';
import { type NoteFormValuesProduct } from '../model';

// TODO: use in components
export const fromSearchResult = ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: ProductSelectOption): NoteFormValuesProduct => ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

// TODO: use in components
export const fromFormValues = (
  id: number,
  {
    name,
    defaultQuantity,
    calories,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): NoteFormValuesProduct => ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

export const toOptionalNutritionValues = ({
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: NoteFormValuesProduct): productModel.OptionalNutritionValues => ({
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
