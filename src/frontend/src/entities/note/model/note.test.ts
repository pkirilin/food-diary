import { describe, expect } from 'vitest';
import { type NoteItem } from '../api';
import { create } from '../lib/dsl';
import { calculateCalories, calculateNutritionValues } from './note';

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
  ])(
    'for %i calories and %i quantity should output %i',
    ([calories, productQuantity, expected]) => {
      const note = create.note({
        product: create.product({ calories }),
        productQuantity,
      });

      expect(calculateCalories(note)).toBe(expected);
    },
  );
});

describe('calculateNutritionValues', () => {
  test('should sum nutrition values for multiple notes and ignore null values', () => {
    const notes: NoteItem[] = [
      create.note({
        product: create.product({
          calories: 120,
          protein: 10,
          fats: 5,
          carbs: 20,
          sugar: null,
          salt: null,
        }),
        productQuantity: 80,
      }),
      create.note({
        product: create.product({
          calories: 300,
          protein: 20,
          fats: 10,
          carbs: 40,
          sugar: 16,
          salt: 2,
        }),
        productQuantity: 60,
      }),
      create.note({
        product: create.product({
          calories: 170,
          protein: null,
          fats: null,
          carbs: null,
          sugar: 0.1,
          salt: null,
        }),
        productQuantity: 120,
      }),
    ];

    const { calories, protein, fats, carbs, sugar, salt } = calculateNutritionValues(notes);

    expect(calories).toBe(480);
    expect(protein).toBe(20);
    expect(fats).toBe(10);
    expect(carbs).toBe(40);
    expect(sugar).toBe(9.72);
    expect(salt).toBe(1.2);
  });
});
