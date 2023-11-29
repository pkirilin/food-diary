import { http, HttpHandler, HttpResponse } from 'msw';
import { API_URL, FAKE_AUTH_ENABLED, FAKE_AUTH_LOGIN_ON_INIT } from 'src/config';
import { AuthProfileResponse } from 'src/features/auth';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/auth/profile`, () =>
    HttpResponse.json({
      isAuthenticated: FAKE_AUTH_ENABLED && FAKE_AUTH_LOGIN_ON_INIT,
    } satisfies AuthProfileResponse),
  ),
];
