import { ItemsFilterBase, SortOrder } from '../__shared__/models';

export interface Page {
  id: number;
  date: string;
}

export interface PageItem extends Page {
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
  sortOrder: SortOrder;
  startDate?: string;
  endDate?: string;
}
