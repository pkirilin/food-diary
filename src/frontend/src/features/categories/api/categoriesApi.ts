import { api } from 'src/api';
import { type SelectOption } from 'src/types';
import { type Category } from '../types';
import {
  type CreateCategoryRequest,
  type DeleteCategoryRequest,
  type EditCategoryRequest,
} from './contracts';

export const categoriesApi = api.injectEndpoints({
  endpoints: builder => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/api/v1/categories',
      providesTags: ['category'],
    }),

    getCategorySelectOptions: builder.query<SelectOption[], unknown>({
      query: () => '/api/v1/categories/autocomplete',
      providesTags: ['category'],
    }),

    createCategory: builder.mutation<void, CreateCategoryRequest>({
      query: category => ({
        method: 'POST',
        url: '/api/v1/categories',
        body: category,
      }),
      invalidatesTags: ['category'],
    }),

    editCategory: builder.mutation<void, EditCategoryRequest>({
      query: ({ id, name }) => ({
        method: 'PUT',
        url: `/api/v1/categories/${id}`,
        body: { name },
      }),
      invalidatesTags: ['category'],
    }),

    deleteCategory: builder.mutation<void, DeleteCategoryRequest>({
      query: id => ({
        method: 'DELETE',
        url: `/api/v1/categories/${id}`,
      }),
      invalidatesTags: ['category', 'product'],
    }),
  }),
});
