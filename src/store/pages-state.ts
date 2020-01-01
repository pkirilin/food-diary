import { PageItem } from '../models';

export interface PagesState {
  list: PagesListState;
}

export interface PagesListState {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
  visiblePages: PageItem[];
}
