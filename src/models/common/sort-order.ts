export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export const invertSortOrder = (sortOrder: SortOrder): SortOrder => {
  return sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
};
