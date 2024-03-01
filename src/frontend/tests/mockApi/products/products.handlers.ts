import { http, type HttpHandler, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import {
  type ProductSelectOption,
  type CreateProductRequest,
  type EditProductRequest,
  type ProductsResponse,
} from 'src/features/products';
import { type SelectOption } from 'src/types';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as productsService from './products.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/products`, ({ request }) => {
    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('pageNumber'));
    const pageSize = Number(url.searchParams.get('pageSize'));
    const categoryId = url.searchParams.get('categoryId');
    const productSearchName = url.searchParams.get('productSearchName');

    const products = productsService.get({
      pageNumber,
      pageSize,
      categoryId: categoryId ? Number(categoryId) : null,
      productSearchName,
    });

    const totalProductsCount = productsService.count();
    const categoryNamesMap = productsService.getCategoryNames(products);

    const response: ProductsResponse = {
      productItems: products.map(({ id, name, caloriesCost, defaultQuantity, categoryId }) => ({
        id,
        name,
        caloriesCost,
        defaultQuantity,
        categoryId,
        categoryName: categoryNamesMap.get(categoryId) ?? 'NULL',
      })),
      totalProductsCount,
    };

    return DelayedHttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/products/autocomplete`, () => {
    const response: SelectOption[] = productsService
      .getAll()
      .map<ProductSelectOption>(({ id, name, defaultQuantity }) => ({ id, name, defaultQuantity }));

    return DelayedHttpResponse.json(response);
  }),

  http.post<PathParams, CreateProductRequest>(`${API_URL}/api/v1/products`, async ({ request }) => {
    const body = await request.json();
    const result = productsService.create(body);

    if (result === 'CategoryNotFound') {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, EditProductRequest>(
    `${API_URL}/api/v1/products/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      const result = productsService.update(id, body);

      if (result === 'CategoryNotFound') {
        return await DelayedHttpResponse.badRequest();
      }

      return await DelayedHttpResponse.ok();
    },
  ),

  http.delete<PathParams, number[]>(`${API_URL}/api/v1/products/batch`, async ({ request }) => {
    const productIds = await request.json();
    productsService.deleteMany(productIds);
    return await DelayedHttpResponse.ok();
  }),
];
