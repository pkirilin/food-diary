import { api } from 'src/api';
import { createUrl } from 'src/utils';
import { type ProductSelectOption, type ProductsResponse } from '../types';
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

    getProductSelectOptions: builder.query<ProductSelectOption[], unknown>({
      query: () => '/api/v1/products/autocomplete',
      providesTags: ['product'],
    }),

    createProduct: builder.mutation<void, CreateProductRequest>({
      query: product => ({
        method: 'POST',
        url: '/api/v1/products',
        body: product,
      }),
      invalidatesTags: ['product', 'note'],
    }),

    editProduct: builder.mutation<void, EditProductRequest>({
      query: ({ id, ...body }) => ({
        method: 'PUT',
        url: `/api/v1/products/${id}`,
        body,
      }),
      invalidatesTags: ['product', 'note'],
    }),

    deleteProducts: builder.mutation<void, DeleteProductsRequest>({
      query: ({ ids }) => ({
        method: 'DELETE',
        url: '/api/v1/products/batch',
        body: ids,
      }),
      invalidatesTags: ['product', 'note'],
    }),
  }),
});
