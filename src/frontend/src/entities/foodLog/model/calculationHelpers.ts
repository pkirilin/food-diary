import { type MealDraftFoodLog, type MealDraftProduct } from './types';

const roundTo2Decimals = (value: number): number => Math.round(value * 100) / 100;

export const addNullable = (a: number | null, b: number | null): number | null => {
  if (a === null && b === null) {
    return null;
  }

  if (a === null) {
    return b;
  }

  if (b === null) {
    return a;
  }

  return roundTo2Decimals(a + b);
};

export const calculateNutritionValue = (
  { product, quantity }: MealDraftFoodLog,
  getValue: (product: MealDraftProduct) => number | null,
): number | null => {
  const value = getValue(product);

  if (value === null) {
    return null;
  }

  return roundTo2Decimals((value * quantity) / 100);
};
