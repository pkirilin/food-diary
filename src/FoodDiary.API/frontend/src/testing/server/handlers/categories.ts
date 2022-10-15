import { rest } from 'msw';
import config from 'src/features/__shared__/config';
import { CategoryFormData } from 'src/features/categories';
import { SelectOption } from 'src/types';
import { db } from '../db';

export const categoriesHandlers = [
  rest.get(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    const categories = db.category.getAll();
    return res(ctx.json(categories));
  }),

  rest.post<CategoryFormData>(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    db.category.create({
      id: 5,
      name: req.body.name,
    });

    return res(ctx.status(200));
  }),

  rest.put<CategoryFormData>(`${config.apiUrl}/api/v1/categories/:id`, (req, res, ctx) => {
    db.category.update({
      where: {
        id: {
          equals: +req.params['id'],
        },
      },

      data: {
        name: req.body.name,
      },
    });

    return res(ctx.status(200));
  }),

  rest.delete(`${config.apiUrl}/api/v1/categories/:id`, (req, res, ctx) => {
    db.category.delete({
      where: {
        id: {
          equals: +req.params['id'],
        },
      },
    });

    return res(ctx.status(200));
  }),

  rest.get(`${config.apiUrl}/api/v1/categories/autocomplete`, (req, res, ctx) => {
    const categories = db.category.getAll().map<SelectOption>(({ id, name }) => ({
      id,
      name,
    }));

    return res(ctx.json(categories));
  }),
];

export const getEmptyCategories = rest.get(
  `${config.apiUrl}/api/v1/categories`,
  (req, res, ctx) => {
    return res(ctx.json([]));
  },
);
