import { PageItem, PageFilter } from '../models';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
}

export interface PagesListState {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
  visiblePages: PageItem[];
}

export type PagesFilterState = PageFilter;
