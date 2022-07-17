import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getToken } from 'src/features/auth';
import config from 'src/features/__shared__/config';
import { EditRequest } from 'src/types';
import { CategoryFormData } from '../types';
import { Category } from '../types';

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

    createCategory: builder.mutation<void, CategoryFormData>({
      query: category => ({
        method: 'POST',
        url: '/',
        body: category,
      }),
    }),

    editCategory: builder.mutation<void, EditRequest<CategoryFormData>>({
      query: ({ id, payload }) => ({
        method: 'PUT',
        url: `/${id}`,
        body: payload,
      }),
    }),

    deleteCategory: builder.mutation<void, number>({
      query: id => ({
        method: 'DELETE',
        url: `/${id}`,
      }),
    }),
  }),
});
