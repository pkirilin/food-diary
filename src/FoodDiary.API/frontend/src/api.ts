import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import config from './features/__shared__/config';
import { getToken, saveToken } from './features/auth/utils';
import { AuthResult } from './features/auth/models';
import { ExportPagesToGoogleDocsRequest } from './features/pages/models';
import { ProductAutocompleteOption } from './features/products/models';
import { CategoryAutocompleteOption } from './features/categories/models';

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiUrl,
    prepareHeaders: headers => {
      headers.append('Authorization', `Bearer ${getToken()}`);
      return headers;
    },
  }),
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
        saveToken(response);
      },
    }),

    exportPagesToGoogleDocs: builder.mutation<void, ExportPagesToGoogleDocsRequest>({
      query: payload => ({
        url: '/api/v1/exports/google-docs',
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    getProductsAutocomplete: builder.query<ProductAutocompleteOption[], boolean>({
      query: () => '/api/v1/products/autocomplete',
    }),

    getCategoriesAutocomplete: builder.query<CategoryAutocompleteOption[], boolean>({
      query: () => '/api/v1/categories/autocomplete',
    }),
  }),
});

export const {
  useLazySignInWithGoogleQuery,
  useLazyGetProductsAutocompleteQuery,
  useLazyGetCategoriesAutocompleteQuery,
  useExportPagesToGoogleDocsMutation,
} = api;

export default api;
