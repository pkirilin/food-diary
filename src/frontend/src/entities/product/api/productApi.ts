import { api } from '@/shared/api';
import { createUrl } from '@/shared/lib';
import {
  type CreateProductResponse,
  type CreateProductRequest,
  type DeleteProductsRequest,
  type EditProductRequest,
  type GetProductsRequest,
  type ProductSelectOption,
  type GetProductsResponse,
  type GetProductByIdResponse,
} from './contracts';

interface CacheInvalidationOptions {
  skipNoteInvalidation?: boolean;
}

export const productApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query<GetProductsResponse, GetProductsRequest>({
      query: request => createUrl('/api/v1/products', { ...request }),
      providesTags: ['product'],
    }),

    productById: builder.query<GetProductByIdResponse, number>({
      query: id => `/api/v1/products/${id}`,
      providesTags: ['product'],
    }),

    productsAutocomplete: builder.query<ProductSelectOption[], null>({
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

    editProduct: builder.mutation<void, EditProductRequest & CacheInvalidationOptions>({
      query: ({ id, ...body }) => ({
        method: 'PUT',
        url: `/api/v1/products/${id}`,
        body,
      }),
      invalidatesTags: (_arg, _err, { skipNoteInvalidation }) =>
        skipNoteInvalidation ? ['product'] : ['product', 'note'],
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
