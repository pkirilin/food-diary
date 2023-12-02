import { http, type HttpHandler, HttpResponse, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import { type NoteCreateEdit } from 'src/features/notes';
import * as notesService from './notes.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/notes`, ({ request }) => {
    const url = new URL(request.url);
    const pageId = parseInt(url.searchParams.get('pageId') ?? '0');
    const notes = notesService.getByPageId(pageId);
    const productsMap = notesService.getProducts(notes);

    const response = notes.map(({ id, mealType, displayOrder, productId, quantity }) => {
      const product = productsMap.get(productId);

      return {
        id,
        mealType,
        displayOrder,
        productId: product?.id,
        productName: product?.name,
        productQuantity: quantity,
        calories: product ? notesService.calculateCalories(quantity, product) : 0,
      };
    });

    return HttpResponse.json(response);
  }),

  http.post<PathParams, NoteCreateEdit>(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const body = await request.json();
    const result = notesService.create(body);

    if (result === 'PageNotFound' || result === 'ProductNotFound') {
      return new HttpResponse(null, { status: 400 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  http.put<{ id: string }, NoteCreateEdit>(
    `${API_URL}/api/v1/notes/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      const result = notesService.update(id, body);

      if (result === 'PageNotFound' || result === 'ProductNotFound') {
        return new HttpResponse(null, { status: 400 });
      }

      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.delete<{ id: string }>(`${API_URL}/api/v1/notes/:id`, ({ params }) => {
    const id = parseInt(params.id);
    notesService.deleteOne(id);
    return new HttpResponse(null, { status: 200 });
  }),
];
