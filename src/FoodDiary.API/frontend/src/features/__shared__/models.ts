export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export enum ExportFormat {
  Json = 'json',
  Pdf = 'pdf',
}

export type Status = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface ItemsFilterBase {
  changed: boolean;
}

export interface AutocompleteOption {
  id: number;
  name: string;
}
