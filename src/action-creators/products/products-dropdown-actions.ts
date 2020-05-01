import { Dispatch } from 'redux';
import { ProductDropdownItem, ProductDropdownSearchRequest } from '../../models';
import {
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
  GetProductDropdownItemsRequestAction,
  ProductsDropdownActionTypes,
  GetProductDropdownItemsActionCreator,
  GetProductDropdownItemsActions,
} from '../../action-types';
import { getProductDropdownItemsAsync } from '../../services';

const getProductDropdownItemsRequest = (): GetProductDropdownItemsRequestAction => {
  return {
    type: ProductsDropdownActionTypes.Request,
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

export const getProductDropdownItems: GetProductDropdownItemsActionCreator = (
  request: ProductDropdownSearchRequest,
) => {
  return async (
    dispatch: Dispatch<GetProductDropdownItemsActions>,
  ): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
    const baseErrorMessage = 'Failed to get products';
    dispatch(getProductDropdownItemsRequest());
    try {
      const response = await getProductDropdownItemsAsync(request);

      if (response.ok) {
        const productDropdownItems = await response.json();
        return dispatch(getProductDropdownItemsSuccess(productDropdownItems));
      }

      switch (response.status) {
        case 400:
          return dispatch(getProductDropdownItemsError(`${baseErrorMessage}: wrong request data`));
        case 500:
          return dispatch(getProductDropdownItemsError(`${baseErrorMessage}: server error`));
        default:
          return dispatch(getProductDropdownItemsError(`${baseErrorMessage}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      return dispatch(getProductDropdownItemsError(baseErrorMessage));
    }
  };
};
