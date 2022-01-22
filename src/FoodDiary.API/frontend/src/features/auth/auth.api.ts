import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../__shared__/config';
import { AuthResult } from './models';
import { saveAccessToken } from './cookie.service';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: config.apiUrl }),
  endpoints: builder => ({
    signInWithGoogle: builder.query<void, string>({
      query: googleTokenId => ({
        url: `/api/v1/auth/google`,
        method: 'POST',
        body: {
          googleTokenId,
        },
      }),
      transformResponse: (response: AuthResult) => {
        saveAccessToken(response);
      },
    }),
  }),
});

export default authApi;
