import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import config from 'src/features/__shared__/config';

import { CategoryAutocompleteOption } from './models';

const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: config.apiUrl }),
  endpoints: builder => ({
    getAutocompleteItems: builder.query<CategoryAutocompleteOption[], boolean>({
      query: () => `/api/v1/categories/autocomplete`,
    }),
  }),
});

export const { useLazyGetAutocompleteItemsQuery } = categoriesApi;

export default categoriesApi;
