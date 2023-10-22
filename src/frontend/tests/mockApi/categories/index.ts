import { db } from '../db';
import data from './categories.data.json';

export { handlers as categoriesHandlers } from './categories.handlers';
export * as categoriesService from './categories.service';

export const fillCategories = (): void => {
  data.forEach(category => {
    db.category.create(category);
  });
};
