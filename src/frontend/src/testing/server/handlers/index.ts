import { categoriesHandlers } from './categories';
import { pagesHandlers } from './pages';
import { productsHandlers } from './products';

export const handlers = [...categoriesHandlers, ...pagesHandlers, ...productsHandlers];
