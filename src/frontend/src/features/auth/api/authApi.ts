import { api } from 'src/api';
import { type AuthProfileResponse } from './contracts';

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<AuthProfileResponse, unknown>({
      query: () => '/api/v1/auth/profile',
    }),
  }),
});
