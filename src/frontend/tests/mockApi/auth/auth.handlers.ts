import { rest, RestHandler } from 'msw';
import { API_URL, FAKE_AUTH_ENABLED, FAKE_AUTH_LOGIN_ON_INIT } from 'src/config';
import { AuthProfileResponse } from 'src/features/auth';

export const handlers: RestHandler[] = [
  rest.get(`${API_URL}/api/v1/auth/profile`, (req, res, ctx) => {
    const response: AuthProfileResponse = {
      isAuthenticated: FAKE_AUTH_ENABLED && FAKE_AUTH_LOGIN_ON_INIT,
    };

    return res(ctx.json(response));
  }),
];
