import { ItemsFilterBase } from '../__shared__/models';

export interface PageItem {
  id: number;
  date: string;
  countNotes: number;
  countCalories: number;
}

export interface PagesSearchResult {
  totalPagesCount: number;
  pageItems: PageItem[];
}

export interface PageCreateEdit {
  date: string;
}

export interface PageItemsFilter extends ItemsFilterBase {
  pageNumber: number;
  pageSize: number;
}
