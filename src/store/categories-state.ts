import { CategoryDropdownItem } from '../models';
import { DataFetchState } from './data-fetch-state';

export interface CategoriesState {
  dropdown: CategoriesDropdownState;
}

export interface CategoriesDropdownState {
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
}
