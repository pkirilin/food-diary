import { db } from '../db';
import data from './pages.data.json';

export { handlers as pagesHandlers } from './pages.handlers';
export * as pagesService from './pages.service';

export const fillPages = (): void => {
  data.forEach(page => {
    db.page.create(page);
  });
};
