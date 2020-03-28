import { CategoryDropdownItem, CategoryItem } from '../models';
import { DataFetchState } from './data-fetch-state';

export interface CategoriesState {
  dropdown: CategoriesDropdownState;
  list: CategoriesListState;
}

export interface CategoriesDropdownState {
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
}

export interface CategoriesListState {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
  currentDraftCategoryId: number;
  editableCategoriesIds: number[];
}
