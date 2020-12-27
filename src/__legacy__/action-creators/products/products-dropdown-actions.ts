import { ProductDropdownItem, ProductDropdownSearchRequest } from '../../models';
import { ProductsDropdownActionTypes } from '../../action-types';
import { createAsyncAction, createErrorResponseHandler, createSuccessJsonResponseHandler } from '../../helpers';
import { API_URL } from '../../config';

export const getProductDropdownItems = createAsyncAction<
  ProductDropdownItem[],
  ProductDropdownSearchRequest,
  ProductsDropdownActionTypes.Request,
  ProductsDropdownActionTypes.Success,
  ProductsDropdownActionTypes.Error
>(
  ProductsDropdownActionTypes.Request,
  ProductsDropdownActionTypes.Success,
  ProductsDropdownActionTypes.Error,
  {
    baseUrl: `${API_URL}/v1/products/dropdown`,
    method: 'GET',
    modifyUrl: (baseUrl, { productNameFilter }) => {
      let requestUrl = baseUrl;

      if (productNameFilter) {
        requestUrl += `?productNameFilter=${encodeURIComponent(productNameFilter)}`;
      }

      return requestUrl;
    },
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get products'),
  },
  'Loading products',
);
