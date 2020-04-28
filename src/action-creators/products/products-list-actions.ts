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

const getProductsSuccess = (productItems: ProductItem[], totalProductsCount: number): GetProductsListSuccessAction => {
  return {
    type: ProductsListActionTypes.Success,
    productItems,
    totalProductsCount,
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
  ProductItem[],
  ProductsFilter,
  GetProductsListSuccessAction | GetProductsListErrorAction
>> = (productsFilter: ProductsFilter) => {
  return async (dispatch: Dispatch): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
    const baseErrorMessage = 'Failed to get products';
    dispatch(getProductsRequest());
    try {
      const response = await getProductsAsync(productsFilter);

      if (response.ok) {
        const { productItems, totalProductsCount } = await response.json();
        return dispatch(getProductsSuccess(productItems, totalProductsCount));
      }

      switch (response.status) {
        case 400:
          return dispatch(getProductsError(`${baseErrorMessage}: wrong request data`));
        case 404:
          return dispatch(getProductsError(`${baseErrorMessage}: category not found`));
        case 500:
          return dispatch(getProductsError(`${baseErrorMessage}: server error`));
        default:
          return dispatch(getProductsError(`${baseErrorMessage}: unknown response code`));
      }
    } catch (error) {
      console.error(baseErrorMessage);
      return dispatch(getProductsError(baseErrorMessage));
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
