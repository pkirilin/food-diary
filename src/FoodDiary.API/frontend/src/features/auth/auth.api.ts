import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../__shared__/config';
import { AuthResult } from './models';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: config.apiUrl }),
  endpoints: builder => ({
    signInWithGoogle: builder.query<AuthResult, string>({
      query: googleTokenId => ({
        url: `/api/v1/auth/google`,
        method: 'POST',
        body: {
          googleTokenId,
        },
      }),
    }),
  }),
});

export default authApi;
