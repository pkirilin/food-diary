import { SortOrder } from './common';

export interface PageItem {
  id: number;
  date: string;
  countNotes: number;
  countCalories: number;
}

export interface PagesFilter {
  sortOrder: SortOrder;
  showCount?: number;
}

export interface PageCreateEdit {
  date: string;
}

export interface PageEditRequest extends PageCreateEdit {
  id: number;
}
