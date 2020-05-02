import { PageItem, PagesFilter } from '../models';
import { DataFetchState, DataOperationState } from './common';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
  operations: PagesOperationsState;
}

export interface PagesListState {
  pageItems: PageItem[];
  pageItemsFetchState: DataFetchState;
  pageDraftItems: PageItem[];
  currentDraftPageId: number;
  editablePagesIds: number[];
  selectedPagesIds: number[];
}

export interface PagesFilterState {
  isChanged: boolean;
  params: PagesFilter;
}

export interface PagesOperationsState {
  status: DataOperationState;
}
