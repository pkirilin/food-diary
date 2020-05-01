import { Dispatch } from 'redux';
import {
  GetProductsListRequestAction,
  ProductsListActionTypes,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
  SetEditableForProductAction,
  GetProductsListActionCreator,
  GetProductsListActions,
} from '../../action-types';
import { ProductItem, ProductsFilter } from '../../models';
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

export const getProducts: GetProductsListActionCreator = (productsFilter: ProductsFilter) => {
  return async (
    dispatch: Dispatch<GetProductsListActions>,
  ): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
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
