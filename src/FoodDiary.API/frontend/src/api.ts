import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import config from './features/__shared__/config';
import { AuthResult } from './features/auth/models';
import { saveAccessToken } from './features/auth/cookie.service';
import { ProductAutocompleteOption } from './features/products/models';
import { CategoryAutocompleteOption } from './features/categories/models';

const api = createApi({
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

    getProductsAutocomplete: builder.query<ProductAutocompleteOption[], boolean>({
      query: () => `/api/v1/products/autocomplete`,
    }),

    getCategoriesAutocomplete: builder.query<CategoryAutocompleteOption[], boolean>({
      query: () => `/api/v1/categories/autocomplete`,
    }),
  }),
});

export const {
  useLazySignInWithGoogleQuery,
  useLazyGetProductsAutocompleteQuery,
  useLazyGetCategoriesAutocompleteQuery,
} = api;

export default api;
