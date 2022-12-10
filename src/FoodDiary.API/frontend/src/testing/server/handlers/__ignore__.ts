import { rest } from 'msw';

export const ignoreHandlers = [
  rest.get('/favicon.ico', (req, res, ctx) => res(ctx.status(200))),
  rest.get('/manifest.json', (req, res, ctx) => res(ctx.json({ start_url: '.' }))),
  rest.get('https://apis.google.com/*', (req, res, ctx) => res(ctx.json({}))),
];
