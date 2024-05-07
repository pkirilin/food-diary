import { api } from '@/shared/api';
import { createUrl } from '@/shared/lib';
import { type ProductsResponse } from '../../../features/products/types';
import {
  type CreateProductResponse,
  type CreateProductRequest,
  type DeleteProductsRequest,
  type EditProductRequest,
  type GetProductsRequest,
  type ProductSelectOption,
} from './contracts';

export const productApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query<ProductsResponse, GetProductsRequest>({
      query: request => createUrl('/api/v1/products', { ...request }),
      providesTags: ['product'],
    }),

    getProductSelectOptions: builder.query<ProductSelectOption[], void>({
      query: () => '/api/v1/products/autocomplete',
      providesTags: ['product'],
    }),

    createProduct: builder.mutation<CreateProductResponse, CreateProductRequest>({
      query: product => ({
        method: 'POST',
        url: '/api/v1/products',
        body: product,
      }),
      invalidatesTags: ['product'],
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
