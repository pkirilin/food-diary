import { useMemo } from 'react';
import { pagesApi } from '../api';

export const useDateForNewPage = (): Date => {
  const query = pagesApi.useGetDateForNewPageQuery();

  return useMemo(
    () => (query.isSuccess && query.data ? new Date(query.data) : new Date()),
    [query.data, query.isSuccess],
  );
};
