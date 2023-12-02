import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { getDateForNewPage } from '../thunks';

export const useDateForNewPage = (isInitialized: boolean): Date => {
  const dateForNewPage = useAppSelector(state => state.pages.dateForNewPage);
  const status = useAppSelector(state => state.pages.dateForNewPageLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isInitialized) {
      void dispatch(getDateForNewPage());
    }
  }, [dispatch, isInitialized]);

  return useMemo(
    () => (status === 'succeeded' && dateForNewPage ? new Date(dateForNewPage) : new Date()),
    [dateForNewPage, status],
  );
};
