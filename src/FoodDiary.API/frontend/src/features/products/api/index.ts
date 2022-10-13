import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { getToken } from 'src/features/auth';
import { createUrl } from 'src/utils';
import { ProductAutocompleteOption, ProductsResponse } from '../types';
import {
  CreateProductRequest,
  DeleteProductsRequest,
  EditProductRequest,
  GetProductsRequest,
} from './contracts';

const productsApi = createApi({
  reducerPath: 'api.products',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/v1/products`,

    prepareHeaders: headers => {
      headers.append('Authorization', `Bearer ${getToken()}`);
      return headers;
    },
  }),

  endpoints: builder => ({
    products: builder.query<ProductsResponse, GetProductsRequest>({
      query: request => ({
        method: 'GET',
        url: createUrl('', request),
      }),
    }),

    productSelectOptions: builder.query<ProductAutocompleteOption[], void>({
      query: () => '/autocomplete',
    }),

    createProduct: builder.mutation<void, CreateProductRequest>({
      query: product => ({
        method: 'POST',
        url: '/',
        body: product,
      }),
    }),

    editProduct: builder.mutation<void, EditProductRequest>({
      query: ({ id, name, caloriesCost, categoryId }) => ({
        method: 'PUT',
        url: `/${id}`,
        body: {
          name,
          caloriesCost,
          categoryId,
        },
      }),
    }),

    deleteProducts: builder.mutation<void, DeleteProductsRequest>({
      query: ({ ids }) => ({
        method: 'DELETE',
        url: '/batch',
        body: ids,
      }),
    }),
  }),
});

export const {
  useProductsQuery,
  useLazyProductSelectOptionsQuery,
  useCreateProductMutation,
  useEditProductMutation,
  useDeleteProductsMutation,
} = productsApi;

export default productsApi;
