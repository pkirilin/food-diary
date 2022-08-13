import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { getToken } from 'src/features/auth';
import { ProductsResponse } from '../types';
import { GetProductsRequest } from './contracts';

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
      query: ({ pageNumber, pageSize }) => ({
        method: 'GET',
        url: `?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      }),
    }),
  }),
});

export const { useProductsQuery } = productsApi;

export default productsApi;
