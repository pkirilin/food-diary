import { rest } from 'msw';
import { API_URL } from 'src/config';
import { ProductsSearchResult } from 'src/features/products/models';
import { db } from '../db';

export const productsHandlers = [
  rest.get(`${API_URL}/v1/products`, (req, res, ctx) => {
    const productItems = db.product.getAll().slice(0, 10);
    const response: ProductsSearchResult = {
      productItems,
      totalProductsCount: 100,
    };

    return res(ctx.json(response));
  }),
];
