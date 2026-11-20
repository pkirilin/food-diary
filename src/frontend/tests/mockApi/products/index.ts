import { db } from '../db';
import data from './products.data.json';

export { handlers as productsHandlers } from './products.handlers';

interface ProductSeed {
  id: number;
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  categoryId: number;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
  sugar: number | null;
  salt: number | null;
}

const seed: ProductSeed[] = data;

export const fillProducts = (): void => {
  seed.forEach(product => {
    db.product.create(product);
  });
};
