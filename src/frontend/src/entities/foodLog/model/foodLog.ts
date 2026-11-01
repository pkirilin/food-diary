import { type MealDraftFoodLog } from './types';

export const calculateCalories = ({ product, quantity }: MealDraftFoodLog): number =>
  Math.floor((product.calories * quantity) / 100);
