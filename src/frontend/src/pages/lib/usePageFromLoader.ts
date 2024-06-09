import { type Page, pagesApi } from '@/features/pages';

const EMPTY_PAGE: Page = { id: 0, date: '' };

export const usePageFromLoader = (pageId: number): Page =>
  pagesApi.useGetPageByIdQuery(pageId, {
    selectFromResult: ({ data, isSuccess }) => (isSuccess ? data.currentPage : EMPTY_PAGE),
  });
