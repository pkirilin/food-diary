import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { PageByIdResponse, PageCreateEdit, PagesSearchResult } from 'src/features/pages';
import { SortOrder } from 'src/types';
import { formatDate } from 'src/utils';
import { mapToPage } from './pages.mapper';
import * as pagesService from './pages.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/pages`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber') ?? 1);
    const pageSize = Number(req.url.searchParams.get('pageSize') ?? 10);
    const sortOrder = Number(req.url.searchParams.get('sortOrder') ?? SortOrder.Descending);
    const startDate = req.url.searchParams.get('startDate');
    const endDate = req.url.searchParams.get('endDate');

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
          countCalories: countCalories,
        };
      }),
      totalPagesCount,
    };

    return res(ctx.json(response));
  }),

  rest.get(`${API_URL}/api/v1/pages/:id`, (req, res, ctx) => {
    if (!req.params.id) {
      return res(ctx.status(404));
    }

    const id = Number(req.params.id);
    const currentDbPage = pagesService.getById(id);

    if (!currentDbPage) {
      return res(ctx.status(404));
    }

    const previousDbPage = pagesService.getPrevious(id);
    const nextDbPage = pagesService.getNext(id);

    const response: PageByIdResponse = {
      currentPage: mapToPage(currentDbPage),
      previousPage: previousDbPage ? mapToPage(previousDbPage) : null,
      nextPage: nextDbPage ? mapToPage(nextDbPage) : null,
    };

    return res(ctx.json(response));
  }),

  rest.post(`${API_URL}/api/v1/pages`, async (req, res, ctx) => {
    const body = await req.json<PageCreateEdit>();
    pagesService.create(body);
    return res(ctx.status(200));
  }),

  rest.put(`${API_URL}/api/v1/pages/:id`, async (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const body = await req.json<PageCreateEdit>();
    pagesService.update(id, body);
    return res(ctx.status(200));
  }),

  rest.delete(`${API_URL}/api/v1/pages/batch`, async (req, res, ctx) => {
    const pageIds = await req.json<number[]>();
    pagesService.deleteMany(pageIds);
    return res(ctx.status(200));
  }),
];
