import { describe, expect } from 'vitest';
import { addNullable, calculateNutritionValue } from './calculationHelpers';
import { create } from './dsl';

describe('addNullable', () => {
  test('returns null if both values are null', () => {
    expect(addNullable(null, null)).toBeNull();
  });

  test('returns the non-null value if one is null', () => {
    expect(addNullable(5, null)).toBe(5);
    expect(addNullable(null, 7)).toBe(7);
  });

  test('returns the sum if both are numbers', () => {
    expect(addNullable(3, 4)).toBe(7);
    expect(addNullable(-2, 2)).toBe(0);
  });
});

describe('calculateNutritionValue', () => {
  test.for([
    {
      value: null,
      productQuantity: 100,
      expected: null,
    },
    {
      value: 3.7,
      productQuantity: 50,
      expected: 1.85,
    },
    {
      value: 11.1,
      productQuantity: 33,
      expected: 3.66,
    },
  ])(
    'returns $expected for value = $value and productQuantity = $productQuantity',
    ({ value, productQuantity, expected }) => {
      const note = create.note({
        product: create.product({ protein: value }),
        productQuantity,
      });
      const nutritionValue = calculateNutritionValue(note, p => p.protein);

      expect(nutritionValue).toBe(expected);
    },
  );
});
