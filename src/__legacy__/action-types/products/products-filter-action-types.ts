import { Action } from 'redux';
import { ProductsFilter } from '../../models';

export enum ProductsFilterActionTypes {
  UpdateFilter = 'PRODUCTS_FILTER__UPDATE',
  ClearFilter = 'PRODUCTS_FILTER__CLEAR',
}

export interface UpdateProductsFilterAction extends Action<ProductsFilterActionTypes.UpdateFilter> {
  type: ProductsFilterActionTypes.UpdateFilter;
  updatedFilter: ProductsFilter;
}

export interface ClearProductsFilterAction extends Action<ProductsFilterActionTypes.ClearFilter> {
  type: ProductsFilterActionTypes.ClearFilter;
}

export type ProductsFilterActions = UpdateProductsFilterAction | ClearProductsFilterAction;
