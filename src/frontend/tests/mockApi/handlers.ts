import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { notesHandlers } from './notes';
import { productsHandlers } from './products';

export const handlers = [
  ...authHandlers,
  ...notesHandlers,
  ...productsHandlers,
  ...categoriesHandlers,
];
