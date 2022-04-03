import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import config from 'src/features/__shared__/config';

import { ProductAutocompleteOption } from './models';

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: config.apiUrl }),
  endpoints: builder => ({
    getAutocompleteItems: builder.query<ProductAutocompleteOption[], boolean>({
      query: () => `/api/v1/products/autocomplete`,
    }),
  }),
});

export const { useLazyGetAutocompleteItemsQuery } = productsApi;

export default productsApi;
