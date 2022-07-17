import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getToken } from 'src/features/auth';
import config from 'src/features/__shared__/config';
import { Category } from '../types';
import { CreateCategoryRequest, DeleteCategoryRequest, EditCategoryRequest } from './contracts';

export default createApi({
  reducerPath: 'api.categories',

  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiUrl}/api/v1/categories`,

    prepareHeaders: headers => {
      headers.append('Authorization', `Bearer ${getToken()}`);
      return headers;
    },
  }),

  endpoints: builder => ({
    categories: builder.query<Category[], void>({
      query: () => ({
        method: 'GET',
        url: '/',
      }),
    }),

    createCategory: builder.mutation<void, CreateCategoryRequest>({
      query: category => ({
        method: 'POST',
        url: '/',
        body: category,
      }),
    }),

    editCategory: builder.mutation<void, EditCategoryRequest>({
      query: ({ id, name }) => ({
        method: 'PUT',
        url: `/${id}`,
        body: { name },
      }),
    }),

    deleteCategory: builder.mutation<void, DeleteCategoryRequest>({
      query: id => ({
        method: 'DELETE',
        url: `/${id}`,
      }),
    }),
  }),
});
