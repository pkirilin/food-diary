import { type Product, type NoteItem } from '../api';
import { MealType } from '../model';

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

export const create = {
  note: ({ product = defaultProduct, productQuantity = 100 }: Partial<NoteItem>): NoteItem => ({
    id: 1,
    date: '2025-06-10',
    mealType: MealType.Breakfast,
    displayOrder: 1,
    productQuantity,
    product,
  }),
  product: (overrides: Partial<Product> = {}): Product => ({
    ...defaultProduct,
    ...overrides,
  }),
} as const;
