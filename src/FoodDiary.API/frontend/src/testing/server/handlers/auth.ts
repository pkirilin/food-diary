import { rest } from 'msw';
import { API_URL } from 'src/config';
import { AuthResult } from 'src/features/auth/models';

export const authHandlers = [
  rest.post(`${API_URL}/api/v1/auth/google`, (req, res, ctx) => {
    return res(
      ctx.json<AuthResult>({
        accessToken: 'test_token',
        tokenExpirationDays: 1,
      }),
    );
  }),
];
