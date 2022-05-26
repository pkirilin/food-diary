import { rest } from 'msw';
import { setupServer } from 'msw/node';

import create from './create';
import config from 'src/features/__shared__/config';

export function api(path: string) {
  return config.apiUrl + path;
}

const handlers = [
  rest.get(api('/v1/pages'), (req, res, ctx) => {
    const pages = create
      .pagesSearchResult()
      .withPageItem('2022-03-01')
      .withPageItem('2022-03-02')
      .withPageItem('2022-03-03')
      .please();

    return res(ctx.json(pages));
  }),

  rest.get(api('/api/v1/products/autocomplete'), (req, res, ctx) => {
    const products = create
      .productAutocompleteResult()
      .withOption('Bread')
      .withOption('Cheese')
      .withOption('Eggs')
      .withOption('Meat')
      .please();

    return res(ctx.json(products));
  }),

  rest.get(api('/api/v1/categories/autocomplete'), (req, res, ctx) => {
    const categories = create
      .categoryAutocompleteResult()
      .withOption('Bakery')
      .withOption('Cereals')
      .withOption('Dairy')
      .withOption('Frozen Foods')
      .please();

    return res(ctx.json(categories));
  }),

  rest.get(api('/api/v1/exports/json'), (req, res, ctx) => {
    return res(ctx.body(new Blob()));
  }),

  rest.post(api('/api/v1/exports/google-docs'), (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];

const server = setupServer(...handlers);

export default server;
