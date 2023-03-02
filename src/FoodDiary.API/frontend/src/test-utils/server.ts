import { rest } from 'msw';
import { setupServer } from 'msw/node';
import config from 'src/features/__shared__/config';
import { handlers } from 'src/testing/server/handlers';
import create from './create';

export function api(path: string) {
  return config.apiUrl + path;
}

const handlersLegacy = [
  rest.get(api('/api/v1/pages'), (req, res, ctx) => {
    const pages = create
      .pagesSearchResult()
      .withPageItem('2022-03-01')
      .withPageItem('2022-03-02')
      .withPageItem('2022-03-03')
      .please();

    return res(ctx.json(pages));
  }),

  rest.get(api('/api/v1/pages/date'), (req, res, ctx) => {
    return res(ctx.json('2022-06-05'));
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

  rest.post(api('/api/v1/imports/json'), (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];

const server = setupServer(...handlersLegacy, ...handlers);

export default server;
