import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/shared/config';

export const api = createApi({
  tagTypes: ['note', 'product', 'category', 'weightLog'],
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: () => ({}),
});
