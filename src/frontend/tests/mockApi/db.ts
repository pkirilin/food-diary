import { factory, primaryKey } from '@mswjs/data';

export const db = factory({
  user: {
    id: primaryKey(Number),
    isAuthenticated: Boolean,
  },

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
    defaultQuantity: Number,
    categoryId: Number,
  },
});

export type DbUser = ReturnType<typeof db.user.findMany>[0];
export type DbPage = ReturnType<typeof db.page.findMany>[0];
export type DbNote = ReturnType<typeof db.note.findMany>[0];
export type DbProduct = ReturnType<typeof db.product.findMany>[0];
export type DbCategory = ReturnType<typeof db.category.findMany>[0];
