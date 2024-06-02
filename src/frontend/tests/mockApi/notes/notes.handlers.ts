import { http, type HttpHandler, type PathParams } from 'msw';
import {
  type CreateNoteRequest,
  type EditNoteRequest,
  type noteModel,
  type RecognizeNoteResponse,
} from '@/entities/note';
import { API_URL } from '@/shared/config';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as notesService from './notes.service';

const parseIntOrNull = (value: string | null): number | null =>
  value === null ? null : parseInt(value);

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const url = new URL(request.url);
    const pageId = parseIntOrNull(url.searchParams.get('pageId'));
    const mealType = parseIntOrNull(url.searchParams.get('mealType'));

    if (pageId === null) {
      return await DelayedHttpResponse.badRequest();
    }

    const notes = notesService.get(pageId, mealType);
    const productsMap = notesService.getProducts(notes);

    const response = notes.map<noteModel.NoteItem>(
      ({ id, mealType, displayOrder, productId, quantity }) => {
        const product = productsMap.get(productId);

        return {
          id,
          mealType,
          displayOrder,
          productId: product?.id ?? 0,
          productName: product?.name ?? '',
          productQuantity: quantity,
          productDefaultQuantity: product?.defaultQuantity ?? 0,
          calories: product ? notesService.calculateCalories(quantity, product) : 0,
        };
      },
    );

    return await DelayedHttpResponse.json(response);
  }),

  http.post<PathParams, CreateNoteRequest>(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const body = await request.json();
    const result = notesService.create(body);

    if (result === 'PageNotFound' || result === 'ProductNotFound') {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, EditNoteRequest>(
    `${API_URL}/api/v1/notes/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      const result = notesService.update(id, body);

      if (result === 'PageNotFound' || result === 'ProductNotFound') {
        return await DelayedHttpResponse.badRequest();
      }

      return await DelayedHttpResponse.ok();
    },
  ),

  http.delete<{ id: string }>(`${API_URL}/api/v1/notes/:id`, async ({ params }) => {
    const id = parseInt(params.id);
    notesService.deleteOne(id);
    return await DelayedHttpResponse.ok();
  }),

  http.post<PathParams, FormData>(`${API_URL}/api/v1/notes/recognitions`, async ({ request }) => {
    const formData = await request.formData();
    const files = formData.getAll('files');

    return await DelayedHttpResponse.json<RecognizeNoteResponse>({
      notes: files.map(file => ({
        product: {
          name: file instanceof File ? file.name : '',
          caloriesCost: Math.floor(Math.random() * 100) + 50,
        },
        quantity: Math.floor(Math.random() * 100) + 50,
      })),
    });
  }),
];
