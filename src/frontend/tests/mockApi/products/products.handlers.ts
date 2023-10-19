import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { ProductsResponse } from 'src/features/products';
import { SelectOption } from 'src/types';
import * as productsService from './products.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/products`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber'));
    const pageSize = Number(req.url.searchParams.get('pageSize'));
    const categoryId = req.url.searchParams.get('categoryId');
    const productSearchName = req.url.searchParams.get('productSearchName');

    const dbProducts = productsService.get({
      pageNumber,
      pageSize,
      categoryId: categoryId ? Number(categoryId) : null,
      productSearchName,
    });

    const totalProductsCount = productsService.count();

    const response: ProductsResponse = {
      productItems: dbProducts.map(({ id, name, caloriesCost, category }) => ({
        id,
        name,
        caloriesCost,
        categoryId: category?.id ?? 0,
        categoryName: category?.name ?? '',
      })),
      totalProductsCount,
    };

    return res(ctx.json(response));
  }),

  rest.get(`${API_URL}/api/v1/products/autocomplete`, (req, res, ctx) => {
    const response: SelectOption[] = productsService.getAll().map(({ id, name }) => ({ id, name }));

    return res(ctx.json(response));
  }),
];
