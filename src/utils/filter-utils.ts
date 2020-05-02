import { SortOrder } from '../models';

export const showCountAllString = 'All';

export const invertSortOrder = (sortOrder: SortOrder): SortOrder => {
  return sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
};
