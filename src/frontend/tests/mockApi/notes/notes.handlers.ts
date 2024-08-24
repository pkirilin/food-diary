import { http, type HttpHandler, type PathParams } from 'msw';
import {
  type CreateNoteRequest,
  type UpdateNoteRequest,
  type RecognizeNoteResponse,
  type NoteItem,
  type GetNotesByDateResponse,
  type GetNotesAggregatedResponse,
  type NoteAggregatedItem,
} from '@/entities/note';
import { API_URL } from '@/shared/config';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as notesService from './notes.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/notes/:date`, async ({ params }) => {
    const date = params.date;

    if (typeof date !== 'string') {
      return await DelayedHttpResponse.badRequest();
    }

    const dbNotes = notesService.getByDate(date);
    const productsMap = notesService.getProducts(dbNotes);

    const notes = dbNotes.map<NoteItem>(
      ({ id, date, mealType, displayOrder, productId, quantity }) => {
        const product = productsMap.get(productId);

        return {
          id,
          date,
          mealType,
          displayOrder,
          productId: product?.id ?? 0,
          productName: product?.name ?? '',
          productQuantity: quantity,
          productDefaultQuantity: product?.defaultQuantity ?? 0,
          calories: notesService.calculateCalories(quantity, product?.caloriesCost ?? 0),
        };
      },
    );

    return await DelayedHttpResponse.json<GetNotesByDateResponse>({ notes });
  }),

  http.get(`${API_URL}/api/v1/notes/aggregated`, async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '';
    const to = url.searchParams.get('to') ?? '';
    const dbNotes = notesService.getAggregated(from, to);
    const productsMap = notesService.getProducts(dbNotes);

    const notes = dbNotes.map<NoteAggregatedItem>(({ date, quantity, productId }) => ({
      date,
      caloriesCount: notesService.calculateCalories(
        quantity,
        productsMap.get(productId)?.caloriesCost ?? 0,
      ),
    }));

    return await DelayedHttpResponse.json<GetNotesAggregatedResponse>({ notes });
  }),

  http.post<PathParams, CreateNoteRequest>(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const body = await request.json();
    const result = notesService.create(body);

    if (result === 'ProductNotFound') {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, UpdateNoteRequest>(
    `${API_URL}/api/v1/notes/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      const result = notesService.update(id, body);

      if (result === 'ProductNotFound') {
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
