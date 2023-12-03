import { http, type HttpHandler, HttpResponse, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import {
  type CreateProductRequest,
  type EditProductRequest,
  type ProductsResponse,
} from 'src/features/products';
import { type SelectOption } from 'src/types';
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
      productItems: products.map(({ id, name, caloriesCost, categoryId }) => ({
        id,
        name,
        caloriesCost,
        categoryId,
        categoryName: categoryNamesMap.get(categoryId) ?? 'NULL',
      })),
      totalProductsCount,
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/products/autocomplete`, () => {
    const response: SelectOption[] = productsService.getAll().map(({ id, name }) => ({ id, name }));

    return HttpResponse.json(response);
  }),

  http.post<PathParams, CreateProductRequest>(`${API_URL}/api/v1/products`, async ({ request }) => {
    const body = await request.json();
    const result = productsService.create(body);

    if (result === 'CategoryNotFound') {
      return new HttpResponse(null, { status: 400 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  http.put<{ id: string }, EditProductRequest>(
    `${API_URL}/api/v1/products/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      const result = productsService.update(id, body);

      if (result === 'CategoryNotFound') {
        return new HttpResponse(null, { status: 400 });
      }

      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.delete<PathParams, number[]>(`${API_URL}/api/v1/products/batch`, async ({ request }) => {
    const productIds = await request.json();
    productsService.deleteMany(productIds);
    return new HttpResponse(null, { status: 200 });
  }),
];
