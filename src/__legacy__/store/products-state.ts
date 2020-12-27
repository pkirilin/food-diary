import { ProductDropdownItem, ProductItem, ProductsFilter } from '../models';
import { DataFetchState, DataOperationState } from './common';

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
  totalProductsCount: number;
}

export interface ProductsOperationsState {
  productOperationStatus: DataOperationState;
}

export interface ProductsFilterState {
  isChanged: boolean;
  params: ProductsFilter;
}
