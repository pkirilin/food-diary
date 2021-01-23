import config from '../__shared__/config';
import { createApiCallAsyncThunk, handleEmptyResponse } from '../__shared__/utils';
import { ProductCreateEdit, ProductsSearchResult } from './models';

export type ProductEditRequest = {
  id: number;
  product: ProductCreateEdit;
};

export const getProducts = createApiCallAsyncThunk<ProductsSearchResult, unknown>(
  'products/getProducts',
  () => `${config.apiUrl}/v1/products`,
  response => response.json(),
  'Failed to get products',
);

export const createProduct = createApiCallAsyncThunk<void, ProductCreateEdit>(
  'products/createProduct',
  () => `${config.apiUrl}/v1/products`,
  handleEmptyResponse,
  'Failed to create product',
  {
    method: 'POST',
    bodyCreator: product => JSON.stringify(product),
  },
);

export const editProduct = createApiCallAsyncThunk<void, ProductEditRequest>(
  'products/editProduct',
  ({ id }) => `${config.apiUrl}/v1/products/${id}`,
  handleEmptyResponse,
  'Failed to update product',
  {
    method: 'PUT',
    bodyCreator: ({ product }) => JSON.stringify(product),
  },
);

export const deleteProduct = createApiCallAsyncThunk<void, number>(
  'products/deleteProduct',
  id => `${config.apiUrl}/v1/products/${id}`,
  handleEmptyResponse,
  'Failed to delete product',
  {
    method: 'DELETE',
  },
);
