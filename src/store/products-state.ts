import { ProductDropdownItem, ProductItem } from '../models';
import { DataFetchState } from './data-fetch-state';

export interface ProductsState {
  dropdown: ProductsDropdownState;
  list: ProductsListState;
}

export interface ProductsDropdownState {
  productDropdownItems: ProductDropdownItem[];
  productDropdownItemsFetchState: DataFetchState;
}

export interface ProductsListState {
  productItems: ProductItem[];
  productItemsFetchState: DataFetchState;
}
