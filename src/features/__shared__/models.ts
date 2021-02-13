export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export type Status = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface ItemsFilterBase {
  changed: boolean;
}

export interface AutocompleteOption {
  id: number;
  name: string;
}
