import { rest } from 'msw';
import config from 'src/features/__shared__/config';
import { categories } from 'src/testing/server/data';

export const categoriesHandlers = [
  rest.get(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    return res(ctx.json(categories.get()));
  }),

  rest.post(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    categories.create({
      name: 'New fancy category',
    });

    return res(ctx.status(200));
  }),

  rest.put(`${config.apiUrl}/api/v1/categories/:id`, (req, res, ctx) => {
    categories.update({
      id: 1,
      name: 'Modified Bakery',
    });

    return res(ctx.status(200));
  }),

  rest.delete(`${config.apiUrl}/api/v1/categories/:id`, (req, res, ctx) => {
    categories.delete({
      id: 1,
    });

    return res(ctx.status(200));
  }),
];
