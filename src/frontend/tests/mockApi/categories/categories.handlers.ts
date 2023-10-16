import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { Category } from 'src/features/categories';
import * as categoriesService from './categories.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/categories`, (req, res, ctx) => {
    const categories = categoriesService.getAll();

    const response: Category[] = categories.map(({ id, name }) => ({
      id,
      name,
      countProducts: categoriesService.getProductsCount(id),
    }));

    return res(ctx.json(response));
  }),
];
