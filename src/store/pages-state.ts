import { PageItem, PagesFilter } from '../models';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
  operations: PagesOperationsState;
}

export interface PagesListState {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
  visiblePages: PageItem[];
  currentDraftPageId: number;
  editablePagesIds: number[];
}

export interface PagesFilterState extends PagesFilter {
  filterChanged: boolean;
}

export interface PagesOperationsState {
  creating?: boolean;
  created?: boolean;
  createError?: boolean;
}
