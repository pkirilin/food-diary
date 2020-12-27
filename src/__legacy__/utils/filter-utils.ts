import { SortOrder } from '../models';

/**
 * Changes sort order to the opposite value
 * @param sortOrder Target sort order
 */
export const invertSortOrder = (sortOrder: SortOrder): SortOrder => {
  return sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
};
