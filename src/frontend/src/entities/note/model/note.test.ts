import { type Product, type NoteItem } from '../api';
import { calculateCalories } from './note';
import { MealType } from './types';

const defaultProduct: Product = {
  id: 1,
  name: 'Sample product',
  defaultQuantity: 100,
  calories: 100,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

const create = {
  note: ({ product = defaultProduct, productQuantity = 100 }: Partial<NoteItem>): NoteItem => ({
    id: 1,
    date: '2025-06-10',
    mealType: MealType.Breakfast,
    displayOrder: 1,
    productId: product.id,
    productName: product.name,
    productQuantity,
    productDefaultQuantity: product.defaultQuantity,
    calories: 100,
    product,
  }),
  product: ({ calories = 100 }: Partial<Product>): Product => ({
    ...defaultProduct,
    calories,
  }),
} as const;

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
