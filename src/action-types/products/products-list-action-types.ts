import { Action, ActionCreator } from 'redux';
import { ProductItem, ProductsFilter } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export enum ProductsListActionTypes {
  Request = 'PRODUCTS_LIST__REQUEST',
  Success = 'PRODUCTS_LIST__SUCCESS',
  Error = 'PRODUCTS_LIST__ERROR',
  SetEditable = 'PRODUCTS_LIST__SET_EDITABLE',
}

export interface GetProductsListRequestAction extends Action<ProductsListActionTypes.Request> {
  type: ProductsListActionTypes.Request;
}

export interface GetProductsListSuccessAction extends Action<ProductsListActionTypes.Success> {
  type: ProductsListActionTypes.Success;
  productItems: ProductItem[];
  totalProductsCount: number;
}

export interface GetProductsListErrorAction extends Action<ProductsListActionTypes.Error> {
  type: ProductsListActionTypes.Error;
  errorMessage: string;
}

export interface SetEditableForProductAction extends Action<ProductsListActionTypes.SetEditable> {
  type: ProductsListActionTypes.SetEditable;
  productId: number;
  editable: boolean;
}

export type GetProductsListActions =
  | GetProductsListRequestAction
  | GetProductsListSuccessAction
  | GetProductsListErrorAction;

export type ProductListActions = GetProductsListActions | SetEditableForProductAction;

export type GetProductsListActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetProductsListSuccessAction | GetProductsListErrorAction>,
    ProductItem[],
    ProductsFilter,
    GetProductsListSuccessAction | GetProductsListErrorAction
  >
>;

export type GetProductsListDispatch = ThunkDispatch<
  ProductItem[],
  ProductsFilter,
  GetProductsListSuccessAction | GetProductsListErrorAction
>;

export type GetProductsListDispatchProp = (
  filter: ProductsFilter,
) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
