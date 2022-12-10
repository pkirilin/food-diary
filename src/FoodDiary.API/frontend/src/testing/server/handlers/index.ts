import { ignoreHandlers } from './__ignore__';
import { categoriesHandlers } from './categories';
import { pagesHandlers } from './pages';
import { productsHandlers } from './products';

export const handlers = [
  ...ignoreHandlers,
  ...categoriesHandlers,
  ...pagesHandlers,
  ...productsHandlers,
];
