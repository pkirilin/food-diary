import { http, HttpHandler, HttpResponse, PathParams } from 'msw';
import { API_URL } from 'src/config';
import { Category, CategoryFormData } from 'src/features/categories';
import { SelectOption } from 'src/types';
import * as categoriesService from './categories.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/categories`, () => {
    const response: Category[] = categoriesService.getAll().map(({ id, name }) => ({
      id,
      name,
      countProducts: categoriesService.getProductsCount(id),
    }));

    return HttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/categories/autocomplete`, () => {
    const categories = categoriesService.getAll().map<SelectOption>(({ id, name }) => ({
      id,
      name,
    }));

    return HttpResponse.json(categories);
  }),

  http.post<PathParams, CategoryFormData>(`${API_URL}/api/v1/categories`, async ({ request }) => {
    const body = await request.json();
    categoriesService.create(body);
    return new HttpResponse(null, { status: 200 });
  }),

  http.put<{ id: string }, CategoryFormData>(
    `${API_URL}/api/v1/categories/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      categoriesService.update(id, body);
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.delete<{ id: string }>(`${API_URL}/api/v1/categories/:id`, ({ params }) => {
    const id = parseInt(params.id);
    categoriesService.deleteOne(id);
    return new HttpResponse(null, { status: 200 });
  }),
];
