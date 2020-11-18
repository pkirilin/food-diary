import { ProductItemsWithTotalCount, ProductsFilter } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

export enum ProductsListActionTypes {
  Request = 'PRODUCTS_LIST__REQUEST',
  Success = 'PRODUCTS_LIST__SUCCESS',
  Error = 'PRODUCTS_LIST__ERROR',
}

export type GetProductsListActions = ThunkHelperAllActions<
  ProductsListActionTypes.Request,
  ProductsListActionTypes.Success,
  ProductsListActionTypes.Error,
  ProductItemsWithTotalCount,
  ProductsFilter
>;

export type GetProductsListResultActions = ThunkHelperResultActions<
  ProductsListActionTypes.Success,
  ProductsListActionTypes.Error,
  ProductItemsWithTotalCount,
  ProductsFilter
>;

export type ProductListActions = GetProductsListActions;

export type GetProductsListDispatch = ThunkDispatch<
  ProductItemsWithTotalCount,
  ProductsFilter,
  GetProductsListResultActions
>;

export type GetProductsListDispatchProp = (filter: ProductsFilter) => Promise<GetProductsListResultActions>;
