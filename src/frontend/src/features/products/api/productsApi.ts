import { api } from 'src/api';
import { type SelectOption } from 'src/types';
import { createUrl } from 'src/utils';
import { type ProductsResponse } from '../types';
import {
  type CreateProductRequest,
  type DeleteProductsRequest,
  type EditProductRequest,
  type GetProductsRequest,
} from './contracts';

export const productsApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query<ProductsResponse, GetProductsRequest>({
      query: request => createUrl('/api/v1/products', { ...request }),
      providesTags: ['product'],
    }),

    getProductSelectOptions: builder.query<SelectOption[], void>({
      query: () => '/api/v1/products/autocomplete',
      providesTags: ['product'],
    }),

    createProduct: builder.mutation<void, CreateProductRequest>({
      query: product => ({
        method: 'POST',
        url: '/api/v1/products',
        body: product,
      }),
      invalidatesTags: ['product'],
    }),

    editProduct: builder.mutation<void, EditProductRequest>({
      query: ({ id, name, caloriesCost, categoryId }) => ({
        method: 'PUT',
        url: `/api/v1/products/${id}`,
        body: {
          name,
          caloriesCost,
          categoryId,
        },
      }),
      invalidatesTags: ['product'],
    }),

    deleteProducts: builder.mutation<void, DeleteProductsRequest>({
      query: ({ ids }) => ({
        method: 'DELETE',
        url: '/api/v1/products/batch',
        body: ids,
      }),
      invalidatesTags: ['product'],
    }),
  }),
});
