import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { AccountProfileResponse } from './contracts';

const accountApi = createApi({
  reducerPath: 'api.account',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/v1/account`,
  }),

  endpoints: builder => ({
    profile: builder.query<AccountProfileResponse, unknown>({
      query: () => ({
        method: 'GET',
        url: '/profile',
      }),
    }),
  }),
});

export const { useProfileQuery } = accountApi;

export default accountApi;
