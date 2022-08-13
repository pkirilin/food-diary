import { rest } from 'msw';
import { API_URL } from 'src/config';
import { ProductsResponse } from 'src/features/products';

import { db } from '../db';

export const productsHandlers = [
  rest.get(`${API_URL}/api/v1/products`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber'));
    const pageSize = Number(req.url.searchParams.get('pageSize'));
    const productItems = db.product.getAll().slice(pageNumber - 1, pageSize);

    const response: ProductsResponse = {
      productItems,
      totalProductsCount: 100,
    };

    return res(ctx.json(response));
  }),
];
