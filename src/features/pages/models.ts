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
