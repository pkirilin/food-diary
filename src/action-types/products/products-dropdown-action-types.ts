import { Action } from 'redux';
import { ProductDropdownItem } from '../../models';

export enum ProductsDropdownActionTypes {
  Request = 'PRODUCTS_DROPDOWN_ITEMS__REQUEST',
  Success = 'PRODUCTS_DROPDOWN_ITEMS__SUCCESS',
  Error = 'PRODUCTS_DROPDOWN_ITEMS__ERROR',
}

export interface GetProductDropdownItemsRequestAction extends Action<ProductsDropdownActionTypes.Request> {
  type: ProductsDropdownActionTypes.Request;
  operationMessage?: string;
}

export interface GetProductDropdownItemsSuccessAction extends Action<ProductsDropdownActionTypes.Success> {
  type: ProductsDropdownActionTypes.Success;
  productDropdownItems: ProductDropdownItem[];
}

export interface GetProductDropdownItemsErrorAction extends Action<ProductsDropdownActionTypes.Error> {
  type: ProductsDropdownActionTypes.Error;
  error?: string;
}

export type ProductsDropdownActions =
  | GetProductDropdownItemsRequestAction
  | GetProductDropdownItemsSuccessAction
  | GetProductDropdownItemsErrorAction;
