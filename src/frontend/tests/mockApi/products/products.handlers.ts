import { http, type HttpHandler, type PathParams } from 'msw';
import {
  type ProductSelectOption,
  type CreateProductRequest,
  type CreateProductResponse,
  type EditProductRequest,
  type GetProductsResponse,
  type GetProductByIdResponse,
} from '@/entities/product';
import { API_URL } from '@/shared/config';
import { type SelectOption } from '@/shared/types';
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

    const response: GetProductsResponse = {
      productItems: products.map(
        ({
          id,
          name,
          caloriesCost,
          defaultQuantity,
          categoryId,
          protein,
          fats,
          carbs,
          sugar,
          salt,
        }) => ({
          id,
          name,
          caloriesCost,
          defaultQuantity,
          protein,
          fats,
          carbs,
          sugar,
          salt,
          categoryId,
          categoryName: categoryNamesMap.get(categoryId) ?? 'NULL',
        }),
      ),
      totalProductsCount,
    };

    return DelayedHttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/products/autocomplete`, () => {
    const response: SelectOption[] = productsService
      .getAll()
      .map<ProductSelectOption>(
        ({ id, name, defaultQuantity, caloriesCost, protein, fats, carbs, sugar, salt }) => ({
          id,
          name,
          defaultQuantity,
          calories: caloriesCost,
          protein,
          fats,
          carbs,
          sugar,
          salt,
        }),
      );

    return DelayedHttpResponse.json(response);
  }),

  http.get<{ id: string }>(`${API_URL}/api/v1/products/:id`, ({ params }) => {
    const id = parseInt(params.id);
    const product = productsService.getById(id);

    if (!product) {
      return DelayedHttpResponse.notFound();
    }

    return DelayedHttpResponse.json<GetProductByIdResponse>({
      id: product.id,
      name: product.name,
      caloriesCost: product.caloriesCost,
      defaultQuantity: product.defaultQuantity,
      protein: product.protein,
      fats: product.fats,
      carbs: product.carbs,
      sugar: product.sugar,
      salt: product.salt,
      category: {
        id: product.categoryId,
        name: productsService.getCategoryNames([product]).get(product.categoryId) ?? 'NULL',
      },
    });
  }),

  http.post<PathParams, CreateProductRequest>(`${API_URL}/api/v1/products`, async ({ request }) => {
    const body = await request.json();
    const result = productsService.create(body);

    if (result.type === 'CategoryNotFound') {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.json<CreateProductResponse>({ id: result.id });
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
