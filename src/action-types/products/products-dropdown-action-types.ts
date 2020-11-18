import { ProductDropdownItem, ProductDropdownSearchRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

export enum ProductsDropdownActionTypes {
  Request = 'PRODUCTS_DROPDOWN_ITEMS__REQUEST',
  Success = 'PRODUCTS_DROPDOWN_ITEMS__SUCCESS',
  Error = 'PRODUCTS_DROPDOWN_ITEMS__ERROR',
}

export type GetProductDropdownItemsActions = ThunkHelperAllActions<
  ProductsDropdownActionTypes.Request,
  ProductsDropdownActionTypes.Success,
  ProductsDropdownActionTypes.Error,
  ProductDropdownItem[],
  ProductDropdownSearchRequest
>;

export type GetProductDropdownItemsResultActions = ThunkHelperResultActions<
  ProductsDropdownActionTypes.Success,
  ProductsDropdownActionTypes.Error,
  ProductDropdownItem[],
  ProductDropdownSearchRequest
>;

export type ProductsDropdownActions = GetProductDropdownItemsActions;

export type GetProductDropdownItemsDispatch = ThunkDispatch<
  ProductDropdownItem[],
  ProductDropdownSearchRequest,
  GetProductDropdownItemsResultActions
>;

export type GetProductDropdownItemsDispatchProp = (
  request: ProductDropdownSearchRequest,
) => Promise<GetProductDropdownItemsResultActions>;
