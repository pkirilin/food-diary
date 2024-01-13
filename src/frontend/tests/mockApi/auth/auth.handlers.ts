import { http, type HttpHandler, HttpResponse } from 'msw';
import { API_URL, FAKE_AUTH_ENABLED, FAKE_AUTH_LOGIN_ON_INIT } from 'src/config';
import { type GetAuthStatusResponse } from 'src/features/auth';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/auth/status`, () =>
    HttpResponse.json<GetAuthStatusResponse>({
      isAuthenticated: FAKE_AUTH_ENABLED && FAKE_AUTH_LOGIN_ON_INIT,
    }),
  ),
];
