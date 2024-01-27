import { type EditPageRequest, type GetPagesRequest } from './api';
import { type PageItem, type PageCreateEdit, type PageItemsFilter } from './models';

export const toGetPagesRequest = ({
  sortOrder,
  pageNumber,
  pageSize,
  startDate,
  endDate,
}: PageItemsFilter): GetPagesRequest => ({
  sortOrder,
  pageNumber,
  pageSize,
  startDate: startDate ?? null,
  endDate: endDate ?? null,
});

export const toEditPageRequest = (page: PageItem, { date }: PageCreateEdit): EditPageRequest => ({
  id: page.id,
  page: { date },
});
