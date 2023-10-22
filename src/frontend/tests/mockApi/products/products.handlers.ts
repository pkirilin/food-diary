import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { CreateProductRequest, EditProductRequest, ProductsResponse } from 'src/features/products';
import { SelectOption } from 'src/types';
import * as productsService from './products.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/products`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber'));
    const pageSize = Number(req.url.searchParams.get('pageSize'));
    const categoryId = req.url.searchParams.get('categoryId');
    const productSearchName = req.url.searchParams.get('productSearchName');

    const products = productsService.get({
      pageNumber,
      pageSize,
      categoryId: categoryId ? Number(categoryId) : null,
      productSearchName,
    });

    const totalProductsCount = productsService.count();
    const categoryNamesMap = productsService.getCategoryNames(products);

    const response: ProductsResponse = {
      productItems: products.map(({ id, name, caloriesCost, categoryId }) => ({
        id,
        name,
        caloriesCost,
        categoryId,
        categoryName: categoryNamesMap.get(categoryId) ?? 'NULL',
      })),
      totalProductsCount,
    };

    return res(ctx.json(response));
  }),

  rest.get(`${API_URL}/api/v1/products/autocomplete`, (req, res, ctx) => {
    const response: SelectOption[] = productsService.getAll().map(({ id, name }) => ({ id, name }));

    return res(ctx.json(response));
  }),

  rest.post(`${API_URL}/api/v1/products`, async (req, res, ctx) => {
    const body = await req.json<CreateProductRequest>();
    const result = productsService.create(body);

    if (result === 'CategoryNotFound') {
      return res(ctx.status(400));
    }

    return res(ctx.status(200));
  }),

  rest.put(`${API_URL}/api/v1/products/:id`, async (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const body = await req.json<EditProductRequest>();
    const result = productsService.update(id, body);

    if (result === 'CategoryNotFound') {
      return res(ctx.status(400));
    }

    return res(ctx.status(200));
  }),

  rest.delete(`${API_URL}/api/v1/products/batch`, async (req, res, ctx) => {
    const productIds = await req.json<number[]>();
    productsService.deleteMany(productIds);
    return res(ctx.status(200));
  }),
];
