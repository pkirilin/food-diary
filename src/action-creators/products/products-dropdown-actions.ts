import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ProductDropdownItem } from '../../models';
import {
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
  GetProductDropdownItemsRequestAction,
  ProductsDropdownActionTypes,
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

export const getProductDropdownItems: ActionCreator<ThunkAction<
  Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>,
  ProductDropdownItem[],
  void,
  GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction
>> = () => {
  return async (
    dispatch: Dispatch,
  ): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
    dispatch(getProductDropdownItemsRequest());

    try {
      const response = await getProductDropdownItemsAsync();
      if (!response.ok) {
        return dispatch(getProductDropdownItemsError());
      }
      const productDropdownItems = await response.json();
      return dispatch(getProductDropdownItemsSuccess(productDropdownItems));
    } catch (error) {
      return dispatch(getProductDropdownItemsError());
    }
  };
};
