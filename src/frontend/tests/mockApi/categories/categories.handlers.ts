import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { Category } from 'src/features/categories';
import { SelectOption } from 'src/types';
import * as categoriesService from './categories.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/categories`, (req, res, ctx) => {
    const response: Category[] = categoriesService.getAll().map(({ id, name }) => ({
      id,
      name,
      countProducts: categoriesService.getProductsCount(id),
    }));

    return res(ctx.json(response));
  }),

  rest.get(`${API_URL}/api/v1/categories/autocomplete`, (req, res, ctx) => {
    const categories = categoriesService.getAll().map<SelectOption>(({ id, name }) => ({
      id,
      name,
    }));

    return res(ctx.json(categories));
  }),
];
