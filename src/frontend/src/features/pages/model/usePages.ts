import { useAppSelector } from '@/store';
import { pagesApi } from '../api';
import { toGetPagesRequest } from '../mapping';
import { type PageItemsFilter, type PageItem } from '../models';

interface Result {
  data: PageItem[];
  totalCount: number;
  filter: PageItemsFilter;
  isFetching: boolean;
  isChanged: boolean;
}

export const usePages = (): Result => {
  const filter = useAppSelector(state => state.pages.filter);
  const request = toGetPagesRequest(filter);

  return pagesApi.useGetPagesQuery(request, {
    selectFromResult: ({ data, isFetching, isSuccess }): Result => ({
      data: data?.pageItems ?? [],
      totalCount: data?.totalPagesCount ?? 0,
      filter,
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
};
