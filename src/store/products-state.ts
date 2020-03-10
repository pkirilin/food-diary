import { ProductDropdownItem, ProductItem } from '../models';
import { DataFetchState } from './data-fetch-state';
import { DataOperationState } from './data-operation-state';

export interface ProductsState {
  dropdown: ProductsDropdownState;
  list: ProductsListState;
  operations: ProductsOperationsState;
}

export interface ProductsDropdownState {
  productDropdownItems: ProductDropdownItem[];
  productDropdownItemsFetchState: DataFetchState;
}

export interface ProductsListState {
  productItems: ProductItem[];
  productItemsFetchState: DataFetchState;
}

export interface ProductsOperationsState {
  productOperationStatus: DataOperationState;
}
