export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export type Status = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface ItemsFilterBase {
  changed: boolean;
}
