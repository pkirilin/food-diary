import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { AuthProfileResponse } from './contracts';

const authApi = createApi({
  reducerPath: 'api.auth',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/v1/auth`,
  }),

  endpoints: builder => ({
    profile: builder.query<AuthProfileResponse, unknown>({
      query: () => ({
        method: 'GET',
        url: '/profile',
      }),
    }),
  }),
});

export const { useProfileQuery } = authApi;

export default authApi;
