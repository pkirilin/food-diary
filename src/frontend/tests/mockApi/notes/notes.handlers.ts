import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { NoteCreateEdit } from 'src/features/notes';
import { notesService } from '.';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/notes`, (req, res, ctx) => {
    const pageId = parseInt(req.url.searchParams.get('pageId') ?? '0');
    const notes = notesService.getByPageId(pageId);
    const productsMap = notesService.getProducts(notes);

    const response = notes.map(({ id, mealType, displayOrder, productId, quantity }) => {
      const product = productsMap.get(productId);

      return {
        id,
        mealType,
        displayOrder,
        productId: product?.id,
        productName: product?.name,
        productQuantity: quantity,
        calories: product ? notesService.calculateCalories(quantity, product) : 0,
      };
    });

    return res(ctx.json(response));
  }),

  rest.post(`${API_URL}/api/v1/notes`, async (req, res, ctx) => {
    const body = await req.json<NoteCreateEdit>();
    const result = notesService.create(body);

    if (result === 'PageNotFound' || result === 'ProductNotFound') {
      return res(ctx.status(400));
    }

    return res(ctx.status(200));
  }),

  rest.put(`${API_URL}/api/v1/notes/:id`, async (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const body = await req.json<NoteCreateEdit>();
    const result = notesService.update(id, body);

    if (result === 'PageNotFound' || result === 'ProductNotFound') {
      return res(ctx.status(400));
    }

    return res(ctx.status(200));
  }),

  rest.delete(`${API_URL}/api/v1/notes/:id`, (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    notesService.deleteOne(id);
    return res(ctx.status(200));
  }),
];
