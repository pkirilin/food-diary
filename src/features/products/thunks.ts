import config from '../__shared__/config';
import { createApiCallAsyncThunk, createUrl, handleEmptyResponse } from '../__shared__/utils';
import { ProductAutocompleteOption, ProductCreateEdit, ProductsSearchResult } from './models';

export type GetProductsRequest = {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  categoryId?: number;
};

export type ProductEditRequest = {
  id: number;
  product: ProductCreateEdit;
};

export const getProducts = createApiCallAsyncThunk<ProductsSearchResult, GetProductsRequest>(
  'products/getProducts',
  params => createUrl(`${config.apiUrl}/v1/products`, params),
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

export const deleteProducts = createApiCallAsyncThunk<void, number[]>(
  'products/deleteProduct',
  () => `${config.apiUrl}/v1/products/batch`,
  handleEmptyResponse,
  'Failed to delete product',
  {
    method: 'DELETE',
    bodyCreator: ids => JSON.stringify(ids),
  },
);

export const getProductsAutocomplete = createApiCallAsyncThunk<
  ProductAutocompleteOption[],
  boolean
>(
  'products/getProductsAutocomplete',
  () => `${config.apiUrl}/v1/products/dropdown`,
  response => response.json(),
  'Failed to get products',
);
