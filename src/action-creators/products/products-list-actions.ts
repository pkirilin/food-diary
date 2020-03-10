import {
  GetProductsListRequestAction,
  ProductsListActionTypes,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
} from '../../action-types';
import { ProductItem } from '../../models';
import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { getProductsAsync } from '../../services';

const getProductsRequest = (): GetProductsListRequestAction => {
  return {
    type: ProductsListActionTypes.Request,
  };
};

const getProductsSuccess = (productItems: ProductItem[]): GetProductsListSuccessAction => {
  return {
    type: ProductsListActionTypes.Success,
    productItems,
  };
};

const getProductsError = (errorMessage: string): GetProductsListErrorAction => {
  return {
    type: ProductsListActionTypes.Error,
    errorMessage,
  };
};

export const getProducts: ActionCreator<ThunkAction<
  Promise<GetProductsListSuccessAction | GetProductsListErrorAction>,
  ProductItem,
  void,
  GetProductsListSuccessAction | GetProductsListErrorAction
>> = () => {
  return async (dispatch: Dispatch): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
    dispatch(getProductsRequest());

    try {
      const response = await getProductsAsync();
      if (!response.ok) {
        return dispatch(getProductsError('Response is not ok'));
      }

      const products = await response.json();
      return dispatch(getProductsSuccess(products));
    } catch (error) {
      return dispatch(getProductsError('Could not fetch products list'));
    }
  };
};
