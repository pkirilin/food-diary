import { SortOrder } from '../models';

export const invertSortOrder = (sortOrder: SortOrder): SortOrder => {
  return sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
};
