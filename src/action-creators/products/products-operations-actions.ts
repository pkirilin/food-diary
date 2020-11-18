import { ProductsOperationsActionTypes } from '../../action-types';
import { API_URL } from '../../config';
import { createAsyncAction, createErrorResponseHandler } from '../../helpers';
import { ProductEditRequest, ProductCreateEdit } from '../../models';

export const createProduct = createAsyncAction<
  {},
  ProductCreateEdit,
  ProductsOperationsActionTypes.CreateRequest,
  ProductsOperationsActionTypes.CreateSuccess,
  ProductsOperationsActionTypes.CreateError
>(
  ProductsOperationsActionTypes.CreateRequest,
  ProductsOperationsActionTypes.CreateSuccess,
  ProductsOperationsActionTypes.CreateError,
  {
    baseUrl: `${API_URL}/v1/products`,
    method: 'POST',
    constructBody: product => JSON.stringify(product),
    onError: createErrorResponseHandler('Failed to create product'),
  },
  'Creating product',
);

export const editProduct = createAsyncAction<
  {},
  ProductEditRequest,
  ProductsOperationsActionTypes.EditRequest,
  ProductsOperationsActionTypes.EditSuccess,
  ProductsOperationsActionTypes.EditError
>(
  ProductsOperationsActionTypes.EditRequest,
  ProductsOperationsActionTypes.EditSuccess,
  ProductsOperationsActionTypes.EditError,
  {
    baseUrl: `${API_URL}/v1/products`,
    method: 'PUT',
    modifyUrl: (baseUrl, { id }) => `${baseUrl}/${id}`,
    constructBody: ({ product }) => JSON.stringify(product),
    onError: createErrorResponseHandler('Failed to update product'),
  },
  'Updating product',
);

export const deleteProduct = createAsyncAction<
  {},
  number,
  ProductsOperationsActionTypes.DeleteRequest,
  ProductsOperationsActionTypes.DeleteSuccess,
  ProductsOperationsActionTypes.DeleteError
>(
  ProductsOperationsActionTypes.DeleteRequest,
  ProductsOperationsActionTypes.DeleteSuccess,
  ProductsOperationsActionTypes.DeleteError,
  {
    baseUrl: `${API_URL}/v1/products`,
    method: 'DELETE',
    modifyUrl: (baseUrl, productId) => `${baseUrl}/${productId}`,
    onError: createErrorResponseHandler('Failed to delete product'),
  },
  'Deleting product',
);
