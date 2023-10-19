import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { notesService } from '.';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/notes`, (req, res, ctx) => {
    const pageId = parseInt(req.url.searchParams.get('pageId') ?? '0');
    const dbNotes = notesService.getByPageId(pageId);

    const response = dbNotes.map(({ id, mealType, displayOrder, product, quantity }) => ({
      id,
      mealType,
      displayOrder,
      productId: product?.id,
      productName: product?.name,
      productQuantity: quantity,
      calories: product ? (quantity * product.caloriesCost) / 100 : 0,
    }));

    return res(ctx.json(response));
  }),
];
