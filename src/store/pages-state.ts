import { PageItem, PagesFilter } from '../models';
import { DataFetchState } from './data-fetch-state';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
  operations: PagesOperationsState;
}

export interface PagesListState {
  pageItems: DataFetchState<PageItem[], string>;
  currentDraftPageId: number;
  editablePagesIds: number[];
  selectedPagesIds: number[];
}

export interface PagesFilterState extends PagesFilter {
  filterChanged: boolean;
}

export interface PagesOperationsState {
  creating?: boolean;
  created?: boolean;
  createError?: boolean;
}
