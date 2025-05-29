import { factory, nullable, primaryKey } from '@mswjs/data';
import { type DATABASE_INSTANCE, type InternalEntityProperties } from '@mswjs/data/lib/glossary';

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

type EntityKey = Exclude<keyof typeof db, typeof DATABASE_INSTANCE>;

type EntityWithInternalProperties<K extends EntityKey> = ReturnType<(typeof db)[K]['findMany']>[0];

type EntityOf<K extends EntityKey> = Omit<
  EntityWithInternalProperties<K>,
  keyof InternalEntityProperties<K>
>;

type UpdatableEntityOf<K extends EntityKey> = Omit<EntityOf<K>, 'id'>;

export type DbUser = EntityOf<'user'>;
export type DbNote = EntityOf<'note'>;
export type DbProduct = EntityOf<'product'>;
export type DbUpdatableProduct = UpdatableEntityOf<'product'>;
export type DbCategory = EntityOf<'category'>;
