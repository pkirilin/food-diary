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
import { ProductItem, ProductsFilter, ErrorReason } from '../../models';
import { getProductsAsync } from '../../services';

const getProductsRequest = (loadingMessage?: string): GetProductsListRequestAction => {
  return {
    type: ProductsListActionTypes.Request,
    loadingMessage,
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

enum ProductsListErrorMessages {
  GetList = 'Failed to get products',
}

export const getProducts: GetProductsListActionCreator = (productsFilter: ProductsFilter) => {
  return async (
    dispatch: Dispatch<GetProductsListActions>,
  ): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
    dispatch(getProductsRequest('Loading products list'));
    try {
      const response = await getProductsAsync(productsFilter);

      if (response.ok) {
        const { productItems, totalProductsCount } = await response.json();
        return dispatch(getProductsSuccess(productItems, totalProductsCount));
      }

      let errorMessage = `${ProductsListErrorMessages.GetList}`;

      switch (response.status) {
        case 400:
          errorMessage += `: ${ErrorReason.WrongRequestData}`;
          break;
        case 404:
          errorMessage += `: category with id = ${productsFilter.categoryId} not found`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getProductsError(errorMessage));
    } catch (error) {
      return dispatch(getProductsError(ProductsListErrorMessages.GetList));
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
