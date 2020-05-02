import { Action, ActionCreator } from 'redux';
import { ProductDropdownItem, ProductDropdownSearchRequest } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export enum ProductsDropdownActionTypes {
  Request = 'PRODUCTS_DROPDOWN_ITEMS__REQUEST',
  Success = 'PRODUCTS_DROPDOWN_ITEMS__SUCCESS',
  Error = 'PRODUCTS_DROPDOWN_ITEMS__ERROR',
}

export interface GetProductDropdownItemsRequestAction extends Action<ProductsDropdownActionTypes.Request> {
  type: ProductsDropdownActionTypes.Request;
  loadingMessage?: string;
}

export interface GetProductDropdownItemsSuccessAction extends Action<ProductsDropdownActionTypes.Success> {
  type: ProductsDropdownActionTypes.Success;
  productDropdownItems: ProductDropdownItem[];
}

export interface GetProductDropdownItemsErrorAction extends Action<ProductsDropdownActionTypes.Error> {
  type: ProductsDropdownActionTypes.Error;
  error?: string;
}

export type GetProductDropdownItemsActions =
  | GetProductDropdownItemsRequestAction
  | GetProductDropdownItemsSuccessAction
  | GetProductDropdownItemsErrorAction;

export type ProductsDropdownActions = GetProductDropdownItemsActions;

export type GetProductDropdownItemsActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>,
    ProductDropdownItem[],
    ProductDropdownSearchRequest,
    GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction
  >
>;

export type GetProductDropdownItemsDispatch = ThunkDispatch<
  ProductDropdownItem[],
  ProductDropdownSearchRequest,
  GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction
>;

export type GetProductDropdownItemsDispatchProp = (
  request: ProductDropdownSearchRequest,
) => Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;
