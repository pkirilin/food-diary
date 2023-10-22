import { db } from '../db';
import data from './products.data.json';

export { handlers as productsHandlers } from './products.handlers';
export * as productsService from './products.service';

export const fillProducts = (): void => {
  data.forEach(product => {
    db.product.create(product);
  });
};
