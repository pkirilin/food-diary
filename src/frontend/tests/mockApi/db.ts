import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data';

export const db = factory({
  page: {
    id: primaryKey(Number),
    date: String,
    notes: manyOf('note'),
  },

  note: {
    id: primaryKey(Number),
    mealType: Number,
    displayOrder: Number,
    quantity: Number,
    pageId: Number,
    product: oneOf('product'),
  },

  category: {
    id: primaryKey(Number),
    name: String,
  },

  product: {
    id: primaryKey(Number),
    name: String,
    caloriesCost: Number,
    category: oneOf('category'),
  },
});
