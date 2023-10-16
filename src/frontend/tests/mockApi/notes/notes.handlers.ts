import { rest, RestHandler } from 'msw';
import { API_URL } from 'src/config';
import { NoteItem } from 'src/features/notes';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/notes`, (req, res, ctx) => {
    const response: NoteItem[] = [
      {
        id: 1,
        mealType: 1,
        displayOrder: 0,
        productId: 1,
        productName: 'Test',
        productQuantity: 100,
        calories: 200,
      },
    ];

    return res(ctx.json(response));
  }),
];
