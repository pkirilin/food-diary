import { CategoryDropdownItem, CategoryItem } from '../models';
import { DataFetchState, DataOperationState, OperationCompletionStatus } from './common';

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
  editableCategoriesIds: number[];
}

export interface CategoriesOperationsState {
  status: DataOperationState;
  completionStatus: OperationCompletionStatus;
}
