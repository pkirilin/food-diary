import { ProductDropdownItem } from '../models';
import { DataFetchState } from './data-fetch-state';

export interface ProductsState {
  dropdown: ProductsDropdownState;
}

export interface ProductsDropdownState {
  productDropdownItems: ProductDropdownItem[];
  productDropdownItemsFetchState: DataFetchState;
}
