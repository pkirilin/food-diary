import { Dispatch } from 'redux';
import { ProductDropdownItem, ProductDropdownSearchRequest, ErrorReason } from '../../models';
import {
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
  GetProductDropdownItemsRequestAction,
  ProductsDropdownActionTypes,
  GetProductDropdownItemsActionCreator,
  GetProductDropdownItemsActions,
} from '../../action-types';
import { getProductDropdownItemsAsync } from '../../services';

const getProductDropdownItemsRequest = (loadingMessage?: string): GetProductDropdownItemsRequestAction => {
  return {
    type: ProductsDropdownActionTypes.Request,
    loadingMessage,
  };
};

const getProductDropdownItemsSuccess = (
  productDropdownItems: ProductDropdownItem[],
): GetProductDropdownItemsSuccessAction => {
  return {
    type: ProductsDropdownActionTypes.Success,
    productDropdownItems,
  };
};

const getProductDropdownItemsError = (error?: string): GetProductDropdownItemsErrorAction => {
  return {
    type: ProductsDropdownActionTypes.Error,
    error,
  };
};

enum ProductsDropdownErrorMessages {
  GetItems = 'Failed to get products',
}

export const getProductDropdownItems: GetProductDropdownItemsActionCreator = (
  request: ProductDropdownSearchRequest,
) => {
  return async (
    dispatch: Dispatch<GetProductDropdownItemsActions>,
  ): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
    dispatch(getProductDropdownItemsRequest('Loading products'));
    try {
      const response = await getProductDropdownItemsAsync(request);

      if (response.ok) {
        const productDropdownItems = await response.json();
        return dispatch(getProductDropdownItemsSuccess(productDropdownItems));
      }

      let errorMessage = `${ProductsDropdownErrorMessages.GetItems}`;

      switch (response.status) {
        case 400:
          errorMessage += `: ${ErrorReason.WrongRequestData}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getProductDropdownItemsError(errorMessage));
    } catch (error) {
      return dispatch(getProductDropdownItemsError(ProductsDropdownErrorMessages.GetItems));
    }
  };
};
