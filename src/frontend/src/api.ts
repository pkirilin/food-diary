import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from '@/shared/config';

export const api = createApi({
  tagTypes: ['page', 'note', 'product', 'category'],
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: () => ({}),
});
