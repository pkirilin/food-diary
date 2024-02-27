import { http, type HttpHandler, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import { type Category, type CategoryFormData } from 'src/features/categories';
import { type SelectOption } from 'src/types';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as categoriesService from './categories.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/categories`, () => {
    const response: Category[] = categoriesService.getAll().map(({ id, name }) => ({
      id,
      name,
      countProducts: categoriesService.getProductsCount(id),
    }));

    return DelayedHttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/categories/autocomplete`, () => {
    const categories = categoriesService.getAll().map<SelectOption>(({ id, name }) => ({
      id,
      name,
    }));

    return DelayedHttpResponse.json(categories);
  }),

  http.post<PathParams, CategoryFormData>(`${API_URL}/api/v1/categories`, async ({ request }) => {
    const body = await request.json();
    categoriesService.create(body);
    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, CategoryFormData>(
    `${API_URL}/api/v1/categories/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      categoriesService.update(id, body);
      return await DelayedHttpResponse.ok();
    },
  ),

  http.delete<{ id: string }>(`${API_URL}/api/v1/categories/:id`, ({ params }) => {
    const id = parseInt(params.id);
    categoriesService.deleteOne(id);
    return DelayedHttpResponse.ok();
  }),
];
