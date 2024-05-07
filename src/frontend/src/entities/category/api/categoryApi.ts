import { api } from '@/shared/api';
import { type SelectOption } from '@/shared/types';
import { type Category } from '../model';
import {
  type CreateCategoryRequest,
  type DeleteCategoryRequest,
  type EditCategoryRequest,
} from './contracts';

export const categoryApi = api.injectEndpoints({
  endpoints: builder => ({
    getCategories: builder.query<Category[], unknown>({
      query: () => '/api/v1/categories',
      providesTags: ['category'],
    }),

    getCategorySelectOptions: builder.query<SelectOption[], void>({
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
