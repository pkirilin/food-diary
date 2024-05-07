import { api } from '@/shared/api';
import { type GetAuthStatusResponse } from './contracts';

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    getStatus: builder.query<GetAuthStatusResponse, unknown>({
      query: () => '/api/v1/auth/status',
    }),
  }),
});
