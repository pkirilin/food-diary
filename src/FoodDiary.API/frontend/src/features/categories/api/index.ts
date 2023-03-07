import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { SelectOption } from 'src/types';
import { Category } from '../types';
import { CreateCategoryRequest, DeleteCategoryRequest, EditCategoryRequest } from './contracts';

const categoriesApi = createApi({
  reducerPath: 'api.categories',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/v1/categories`,
  }),

  endpoints: builder => ({
    categories: builder.query<Category[], void>({
      query: () => ({
        method: 'GET',
        url: '/',
      }),
    }),

    categorySelectOptions: builder.query<SelectOption[], void>({
      query: () => '/autocomplete',
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

export const {
  useCategoriesQuery,
  useLazyCategorySelectOptionsQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;

export default categoriesApi;
