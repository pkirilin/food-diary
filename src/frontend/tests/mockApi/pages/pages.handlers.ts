import { http, type HttpHandler, HttpResponse, type PathParams } from 'msw';
import { API_URL } from 'src/config';
import {
  type PageByIdResponse,
  type PageCreateEdit,
  type PagesSearchResult,
} from 'src/features/pages';
import { SortOrder } from 'src/types';
import { formatDate } from 'src/utils';
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

    return HttpResponse.json(response);
  }),

  http.get(`${API_URL}/api/v1/pages/date`, () => {
    const date = new Date(pagesService.getNewPageDate());
    const response: string = formatDate(date);
    return HttpResponse.json(response);
  }),

  http.get<{ id: string }>(`${API_URL}/api/v1/pages/:id`, ({ params }) => {
    if (!params.id) {
      return new HttpResponse(null, { status: 404 });
    }

    const id = Number(params.id);
    const currentDbPage = pagesService.getById(id);

    if (!currentDbPage) {
      return new HttpResponse(null, { status: 404 });
    }

    const response: PageByIdResponse = {
      currentPage: mapToPage(currentDbPage),
    };

    return HttpResponse.json(response);
  }),

  http.post<PathParams, PageCreateEdit>(`${API_URL}/api/v1/pages`, async ({ request }) => {
    const body = await request.json();
    pagesService.create(body);
    return new HttpResponse(null, { status: 200 });
  }),

  http.put<{ id: string }, PageCreateEdit>(
    `${API_URL}/api/v1/pages/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id);
      const body = await request.json();
      pagesService.update(id, body);
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.delete<PathParams, number[]>(`${API_URL}/api/v1/pages/batch`, async ({ request }) => {
    const pageIds = await request.json();
    pagesService.deleteMany(pageIds);
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(`${API_URL}/api/v1/imports/json`, () => new HttpResponse(null, { status: 200 })),

  http.get(`${API_URL}/api/v1/exports/json`, () => new HttpResponse(new Blob())),

  http.post(`${API_URL}/api/v1/exports/google-docs`, () => new HttpResponse(null, { status: 200 })),
];
