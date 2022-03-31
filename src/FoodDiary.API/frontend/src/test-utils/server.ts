import { rest } from 'msw';
import { setupServer } from 'msw/node';

import create from './create';
import config from 'src/features/__shared__/config';

function api(path: string) {
  return config.apiUrl + path;
}

const handlers = [
  rest.get(api('/v1/pages'), (req, res, ctx) => {
    const pages = create
      .pagesSearchResultModel()
      .withPageItem('2022-03-01')
      .withPageItem('2022-03-02')
      .withPageItem('2022-03-03')
      .please();

    return res(ctx.json(pages));
  }),
];

const server = setupServer(...handlers);

export default server;
