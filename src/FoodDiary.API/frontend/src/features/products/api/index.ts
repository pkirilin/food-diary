import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { API_URL } from 'src/config';
import { getToken } from 'src/features/auth';
import { createUrl } from 'src/utils';
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
      query: request => ({
        method: 'GET',
        url: createUrl('', request),
      }),
    }),
  }),
});

export const { useProductsQuery } = productsApi;

export default productsApi;
