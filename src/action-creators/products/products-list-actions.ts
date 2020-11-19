import { ProductsListActionTypes } from '../../action-types';
import { API_URL } from '../../config';
import { createAsyncAction, createErrorResponseHandler, createSuccessJsonResponseHandler } from '../../helpers';
import { ProductItemsWithTotalCount, ProductsFilter } from '../../models';

export const getProducts = createAsyncAction<
  ProductItemsWithTotalCount,
  ProductsFilter,
  ProductsListActionTypes.Request,
  ProductsListActionTypes.Success,
  ProductsListActionTypes.Error
>(
  ProductsListActionTypes.Request,
  ProductsListActionTypes.Success,
  ProductsListActionTypes.Error,
  {
    baseUrl: `${API_URL}/v1/products`,
    method: 'GET',
    modifyUrl: (baseUrl, { pageSize, pageNumber, categoryId, productName }) => {
      let requestUrl = `${baseUrl}?pageSize=${pageSize}`;

      if (pageNumber) {
        requestUrl += `&pageNumber=${pageNumber}`;
      }
      if (categoryId) {
        requestUrl += `&categoryId=${categoryId}`;
      }
      if (productName) {
        requestUrl += `&productSearchName=${productName}`;
      }

      return requestUrl;
    },
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get products', {
      404: () => 'category not found',
    }),
  },
  'Loading products list',
);
