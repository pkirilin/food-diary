import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { notesHandlers } from './notes';
import { pagesHandlers } from './pages';
import { productsHandlers } from './products';

export const handlers = [
  ...authHandlers,
  ...pagesHandlers,
  ...notesHandlers,
  ...productsHandlers,
  ...categoriesHandlers,
];
