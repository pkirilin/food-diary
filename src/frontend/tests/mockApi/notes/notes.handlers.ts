import { http, type HttpHandler, type PathParams } from 'msw';
import {
  type RecognizeNoteResponse,
  type NoteItem,
  type GetNotesResponse,
  type GetNotesHistoryResponse,
  type NoteHistoryItem,
  type NoteRequestBody,
} from '@/entities/note';
import { API_URL } from '@/shared/config';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as notesService from './notes.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return await DelayedHttpResponse.badRequest();
    }

    const dbNotes = notesService.getByDate(date);
    const productsMap = notesService.getProducts(dbNotes);

    const notes = dbNotes.map(({ id, date, mealType, displayOrder, productId, quantity }) => {
      const product = productsMap.get(productId);

      return {
        id,
        date,
        mealType,
        displayOrder,
        productQuantity: quantity,
        product: {
          id: product?.id ?? 0,
          name: product?.name ?? '',
          defaultQuantity: product?.defaultQuantity ?? 0,
          calories: product?.caloriesCost ?? 0,
          protein: product?.protein ?? null,
          fats: product?.fats ?? null,
          carbs: product?.carbs ?? null,
          sugar: product?.sugar ?? null,
          salt: product?.salt ?? null,
        },
      } satisfies NoteItem;
    });

    return await DelayedHttpResponse.json<GetNotesResponse>({ notes });
  }),

  http.get(`${API_URL}/api/v1/notes/history`, async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '';
    const to = url.searchParams.get('to') ?? '';
    const notesMap = notesService.getHistory(from, to);
    const productsMap = notesService.getProducts(Array.from(notesMap.values()).flat());

    const notesHistory = Array.from(notesMap.entries()).map<NoteHistoryItem>(([date, notes]) => ({
      date,
      caloriesCount: notes.reduce(
        (sum, note) =>
          sum +
          notesService.calculateCalories(
            note.quantity,
            productsMap.get(note.productId)?.caloriesCost ?? 0,
          ),
        0,
      ),
    }));

    return await DelayedHttpResponse.json<GetNotesHistoryResponse>({ notesHistory });
  }),

  http.post<PathParams, NoteRequestBody>(`${API_URL}/api/v1/notes`, async ({ request }) => {
    const body = await request.json();
    const result = notesService.create(body);

    if (result === 'ProductNotFound') {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, NoteRequestBody>(
    `${API_URL}/api/v1/notes/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const note = await request.json();
      const result = notesService.update({ id, note });

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
          protein: 12.3,
          fats: 5.67,
          carbs: 21,
          sugar: null,
          salt: 0.1,
        },
        quantity: Math.floor(Math.random() * 100) + 50,
      })),
    });
  }),
];
