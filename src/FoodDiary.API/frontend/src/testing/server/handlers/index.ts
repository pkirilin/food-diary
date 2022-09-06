import { categoriesHandlers } from './categories';
import { productsHandlers } from './products';

export const handlers = [...categoriesHandlers, ...productsHandlers];
