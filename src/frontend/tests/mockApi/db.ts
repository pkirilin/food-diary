import { factory, primaryKey } from '@mswjs/data';

export const db = factory({
  page: {
    id: primaryKey(Number),
    date: Number,
  },

  note: {
    id: primaryKey(Number),
    mealType: Number,
    displayOrder: Number,
    quantity: Number,
    pageId: Number,
    productId: Number,
  },

  category: {
    id: primaryKey(Number),
    name: String,
  },

  product: {
    id: primaryKey(Number),
    name: String,
    caloriesCost: Number,
    categoryId: Number,
  },
});

export type Db = typeof db;

export type DbPage = NonNullable<ReturnType<Db['page']['findFirst']>>;
export type DbNote = NonNullable<ReturnType<Db['note']['findFirst']>>;
export type DbProduct = NonNullable<ReturnType<Db['product']['findFirst']>>;
