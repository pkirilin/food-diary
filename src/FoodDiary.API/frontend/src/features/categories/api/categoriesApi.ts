import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import config from 'src/features/__shared__/config';
import { Category } from '../types';

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Bakery',
    countProducts: 1,
  },
  {
    id: 2,
    name: 'Cereals',
    countProducts: 5,
  },
  {
    id: 3,
    name: 'Dairy',
    countProducts: 2,
  },
  {
    id: 4,
    name: 'Frozen Foods',
    countProducts: 0,
  },
];

export default createApi({
  reducerPath: 'api.categories',

  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiUrl}/api/v1/categories`,
  }),

  endpoints: builder => ({
    categories: builder.query<Category[], void>({
      queryFn: () => ({ data: MOCK_CATEGORIES }),
    }),
  }),
});
