import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';

export const handlers = [...authHandlers, ...categoriesHandlers];
