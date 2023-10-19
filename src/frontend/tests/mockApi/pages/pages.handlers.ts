import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { PageByIdResponse, PagesSearchResult } from 'src/features/pages';
import { SortOrder } from 'src/types';
import { mapToPage } from './pages.mapper';
import * as pagesService from './pages.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/pages`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber') ?? 1);
    const pageSize = Number(req.url.searchParams.get('pageSize') ?? 10);
    const sortOrder = Number(req.url.searchParams.get('sortOrder') ?? SortOrder.Descending);

    const pages = pagesService.get({
      pageNumber,
      pageSize,
      sortOrder,
    });

    const totalPagesCount = pagesService.count();

    const response: PagesSearchResult = {
      pageItems: pages.map(({ id, date }) => {
        const notes = pagesService.getNotes(id);
        const countCalories = pagesService.calculateCalories(notes);

        return {
          id,
          date,
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
];
