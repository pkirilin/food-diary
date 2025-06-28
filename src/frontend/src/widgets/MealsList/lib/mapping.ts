import { type Product } from '@/entities/note';
import { type productModel } from '@/entities/product';

export const toOptionalNutritionValues = ({
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: Product): productModel.OptionalNutritionValues => ({
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
