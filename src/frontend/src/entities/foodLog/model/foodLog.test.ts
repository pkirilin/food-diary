import { describe, expect } from 'vitest';
import { calculateCalories } from './foodLog';
import { type MealDraftProduct } from './types';

const createProduct = ({ calories = 0 }: Partial<MealDraftProduct>): MealDraftProduct => ({
  id: 1,
  name: 'Product',
  defaultQuantity: 100,
  calories,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
});

describe('calculateCalories', () => {
  test.for([
    [0, 0, 0],
    [100, 0, 0],
    [0, 100, 0],
    [120, 80, 96],
    [300, 60, 180],
    [170, 120, 204],
    [80, 240, 192],
    [168, 223, 374],
  ])('for %i calories and %i quantity should output %i', ([calories, quantity, expected]) => {
    expect(calculateCalories({ product: createProduct({ calories }), quantity })).toBe(expected);
  });
});
