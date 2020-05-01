import { CategoryDropdownItem, CategoryItem } from '../models';
import { DataFetchState } from './data-fetch-state';
import { DataOperationState } from './data-operation-state';

export interface CategoriesState {
  dropdown: CategoriesDropdownState;
  list: CategoriesListState;
  operations: CategoriesOperationsState;
}

export interface CategoriesDropdownState {
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
}

export interface CategoriesListState {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
  categoryDraftItems: CategoryItem[];
  currentDraftCategoryId: number;
  editableCategoriesIds: number[];
}

export interface CategoriesOperationsState {
  status: DataOperationState;
}
