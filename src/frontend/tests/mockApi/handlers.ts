import { categoriesHandlers } from './categories';
import { notesHandlers } from './notes';
import { pagesHandlers } from './pages';
import { productsHandlers } from './products';

export const handlers = [
  ...pagesHandlers,
  ...notesHandlers,
  ...productsHandlers,
  ...categoriesHandlers,
];
