import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { Category, CategoryFormData } from 'src/features/categories';
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

  rest.post(`${API_URL}/api/v1/categories`, async (req, res, ctx) => {
    const body = await req.json<CategoryFormData>();
    categoriesService.create(body);
    return res(ctx.status(200));
  }),

  rest.put(`${API_URL}/api/v1/categories/:id`, async (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const body = await req.json<CategoryFormData>();
    categoriesService.update(id, body);
    return res(ctx.status(200));
  }),

  rest.delete(`${API_URL}/api/v1/categories/:id`, (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    categoriesService.deleteOne(id);
    return res(ctx.status(200));
  }),
];
