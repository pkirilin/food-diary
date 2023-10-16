import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { PageByIdResponse, PagesSearchResult } from 'src/features/pages';
import * as pagesService from './pages.service';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/pages`, (req, res, ctx) => {
    const dbPages = pagesService.getAll();

    const response: PagesSearchResult = {
      pageItems: dbPages.map(({ id, date, notes }) => ({
        id,
        date,
        countNotes: notes.length,
        countCalories: 0,
      })),
      totalPagesCount: 100,
    };

    return res(ctx.json(response));
  }),

  rest.get(`${API_URL}/api/v1/pages/:id`, (req, res, ctx) => {
    const response: PageByIdResponse = {
      previousPage: {
        id: 1,
        date: '2022-01-01',
      },
      currentPage: {
        id: 2,
        date: '2022-01-02',
      },
      nextPage: {
        id: 3,
        date: '2022-01-03',
      },
    };

    return res(ctx.json(response));
  }),
];
