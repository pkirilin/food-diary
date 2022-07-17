import { rest } from 'msw';
import { Category } from 'src/features/categories';
import config from 'src/features/__shared__/config';

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Bakery',
    countProducts: 1,
  },
  {
    id: 2,
    name: 'Cereals',
    countProducts: 5,
  },
  {
    id: 3,
    name: 'Dairy',
    countProducts: 2,
  },
  {
    id: 4,
    name: 'Frozen Foods',
    countProducts: 0,
  },
];

export const categoriesHandlers = [
  rest.get(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    return res(ctx.json(MOCK_CATEGORIES));
  }),

  rest.post(`${config.apiUrl}/api/v1/categories`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.put(`${config.apiUrl}/api/v1/categories/:id`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
