import { rest } from 'msw';
import config from 'src/features/__shared__/config';
import { PagesSearchResult } from 'src/features/pages/models';
import { db } from '../db';

export const pagesHandlers = [
  rest.get(`${config.apiUrl}/v1/pages`, (req, res, ctx) => {
    const pageItems = db.page.getAll();

    const result: PagesSearchResult = {
      pageItems,
      totalPagesCount: 100,
    };

    return res(ctx.json(result));
  }),
];
