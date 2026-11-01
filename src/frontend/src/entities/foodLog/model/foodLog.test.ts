import { describe, expect } from 'vitest';
import { createProduct } from './dsl';
import { calculateCalories, calculateNutritionValues } from './foodLog';
import { type MealDraftFoodLog } from './types';

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

describe('calculateNutritionValues', () => {
  test('should sum nutrition values for multiple food logs and ignore null values', () => {
    const foodLogs: MealDraftFoodLog[] = [
      {
        product: createProduct({
          calories: 120,
          protein: 10,
          fats: 5,
          carbs: 20,
          sugar: null,
          salt: null,
        }),
        quantity: 80,
      },
      {
        product: createProduct({
          calories: 300,
          protein: 20,
          fats: 10,
          carbs: 40,
          sugar: 16,
          salt: 2,
        }),
        quantity: 60,
      },
      {
        product: createProduct({
          calories: 170,
          protein: null,
          fats: null,
          carbs: null,
          sugar: 0.1,
          salt: null,
        }),
        quantity: 120,
      },
    ];

    const { calories, protein, fats, carbs, sugar, salt } = calculateNutritionValues(foodLogs);

    expect(calories).toBe(480);
    expect(protein).toBe(20);
    expect(fats).toBe(10);
    expect(carbs).toBe(40);
    expect(sugar).toBe(9.72);
    expect(salt).toBe(1.2);
  });
});
