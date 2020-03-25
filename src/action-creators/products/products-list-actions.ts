import {
  GetProductsListRequestAction,
  ProductsListActionTypes,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
  SetEditableForProductAction,
} from '../../action-types';
import { ProductItem, ProductsFilter } from '../../models';
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
  ProductsFilter,
  GetProductsListSuccessAction | GetProductsListErrorAction
>> = (productsFilter: ProductsFilter) => {
  return async (dispatch: Dispatch): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
    dispatch(getProductsRequest());

    try {
      const response = await getProductsAsync(productsFilter);
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

export const setEditableForProduct = (productId: number, editable: boolean): SetEditableForProductAction => {
  return {
    type: ProductsListActionTypes.SetEditable,
    productId,
    editable,
  };
};
