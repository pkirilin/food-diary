import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import config from './features/__shared__/config';
import { getToken } from './features/auth/utils';
import { CategoryAutocompleteOption } from './features/categories/models';
import { ExportPagesToGoogleDocsRequest } from './features/pages/models';
import { ProductAutocompleteOption } from './features/products/models';

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiUrl,
    prepareHeaders: headers => {
      headers.append('Authorization', `Bearer ${getToken()}`);
      return headers;
    },
  }),
  endpoints: builder => ({
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
  useLazyGetProductsAutocompleteQuery,
  useLazyGetCategoriesAutocompleteQuery,
  useExportPagesToGoogleDocsMutation,
} = api;

export default api;
