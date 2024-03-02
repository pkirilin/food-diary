import { http, type HttpHandler, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import {
  type PageByIdResponse,
  type PageCreateEdit,
  type PagesSearchResult,
} from 'src/features/pages';
import { SortOrder } from 'src/types';
import { formatDate } from 'src/utils';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import { mapToPage } from './pages.mapper';
import * as pagesService from './pages.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/pages`, ({ request }) => {
    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
    const sortOrder = Number(url.searchParams.get('sortOrder') ?? SortOrder.Descending);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const pages = pagesService.get({
      pageNumber,
      pageSize,
      sortOrder,
      startDate,
      endDate,
    });

    const totalPagesCount = pagesService.count();

    const response: PagesSearchResult = {
      pageItems: pages.map(({ id, date }) => {
        const notes = pagesService.getNotes(id);
        const countCalories = pagesService.calculateCalories(notes);

        return {
          id,
          date: formatDate(new Date(date)),
          countNotes: notes.length,
          countCalories,
        };
      }),
      totalPagesCount,
    };

    return DelayedHttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/pages/date`, () => {
    const date = new Date(pagesService.getNewPageDate());
    const response: string = formatDate(date);
    return DelayedHttpResponse.json(response);
  }),

  http.get<{ id: string }>(`${API_URL}/api/v1/pages/:id`, ({ params }) => {
    if (!params.id) {
      return DelayedHttpResponse.notFound();
    }

    const id = Number(params.id);
    const currentDbPage = pagesService.getById(id);

    if (!currentDbPage) {
      return DelayedHttpResponse.notFound();
    }

    const response: PageByIdResponse = {
      currentPage: mapToPage(currentDbPage),
    };

    return DelayedHttpResponse.json(response);
  }),

  http.post<PathParams, PageCreateEdit>(`${API_URL}/api/v1/pages`, async ({ request }) => {
    const body = await request.json();
    pagesService.create(body);
    return await DelayedHttpResponse.ok();
  }),

  http.put<{ id: string }, PageCreateEdit>(
    `${API_URL}/api/v1/pages/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      pagesService.update(id, body);
      return await DelayedHttpResponse.ok();
    },
  ),

  http.delete<PathParams, number[]>(`${API_URL}/api/v1/pages/batch`, async ({ request }) => {
    const pageIds = await request.json();
    pagesService.deleteMany(pageIds);
    return await DelayedHttpResponse.ok();
  }),

  http.post(`${API_URL}/api/v1/imports/json`, () => DelayedHttpResponse.ok()),

  http.get(`${API_URL}/api/v1/exports/json`, () => DelayedHttpResponse.file(new Blob())),

  http.post(`${API_URL}/api/v1/exports/google-docs`, () => DelayedHttpResponse.ok()),
];
