import { ProductDropdownItem, ProductItem, ProductsFilter } from '../models';
import { DataFetchState } from './data-fetch-state';
import { DataOperationState } from './data-operation-state';

export interface ProductsState {
  dropdown: ProductsDropdownState;
  list: ProductsListState;
  operations: ProductsOperationsState;
  filter: ProductsFilterState;
}

export interface ProductsDropdownState {
  productDropdownItems: ProductDropdownItem[];
  productDropdownItemsFetchState: DataFetchState;
}

export interface ProductsListState {
  productItems: ProductItem[];
  productItemsFetchState: DataFetchState;
  editableProductsIds: number[];
  totalProductsCount: number;
}

export interface ProductsOperationsState {
  productOperationStatus: DataOperationState;
}

export type ProductsFilterState = ProductsFilter;
