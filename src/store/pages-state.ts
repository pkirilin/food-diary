import { PageItem, PagesFilter } from '../models';
import { DataFetchState } from './data-fetch-state';
import { DataOperationState } from './data-operation-state';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
  operations: PagesOperationsState;
}

export interface PagesListState {
  pageItems: PageItem[];
  pageItemsFetchState: DataFetchState;
  currentDraftPageId: number;
  editablePagesIds: number[];
  selectedPagesIds: number[];
}

export interface PagesFilterState extends PagesFilter {
  filterChanged: boolean;
}

export interface PagesOperationsState {
  status: DataOperationState;
}
