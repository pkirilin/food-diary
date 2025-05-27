import { factory, nullable, primaryKey } from '@mswjs/data';

export const db = factory({
  user: {
    id: primaryKey(Number),
    isAuthenticated: Boolean,
  },

  note: {
    id: primaryKey(Number),
    date: Date,
    mealType: Number,
    displayOrder: Number,
    quantity: Number,
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
    protein: nullable(Number),
    fats: nullable(Number),
    carbs: nullable(Number),
    sugar: nullable(Number),
    salt: nullable(Number),
  },

  weightLog: {
    date: primaryKey(Date),
    value: Number,
  },
});

export type DbUser = ReturnType<typeof db.user.findMany>[0];
export type DbNote = ReturnType<typeof db.note.findMany>[0];
export type DbProduct = ReturnType<typeof db.product.findMany>[0];
export type DbCategory = ReturnType<typeof db.category.findMany>[0];
