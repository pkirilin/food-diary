import { type MealDraftProduct } from './types';

export const createProduct = ({
  calories = 0,
  protein = null,
  fats = null,
  carbs = null,
  sugar = null,
  salt = null,
}: Partial<MealDraftProduct>): MealDraftProduct => ({
  id: 1,
  name: 'Product',
  defaultQuantity: 100,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
