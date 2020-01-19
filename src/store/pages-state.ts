import { PageItem, PagesFilter } from '../models';

export interface PagesState {
  list: PagesListState;
  filter: PagesFilterState;
}

export interface PagesListState {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
  visiblePages: PageItemState[];
}

export interface PageItemState extends PageItem {
  editable?: boolean;
}

export type PagesFilterState = PagesFilter;
