import { http, type HttpHandler, HttpResponse } from 'msw';
import { type GetAuthStatusResponse } from '@/features/auth';
import { API_URL } from '@/shared/config';
import { usersService } from '../user';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/v1/auth/status`, () => {
    const user = usersService.findById(1);

    return HttpResponse.json<GetAuthStatusResponse>({
      isAuthenticated: user?.isAuthenticated ?? false,
    });
  }),
];
