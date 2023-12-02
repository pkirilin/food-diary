import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from 'src/store';
import { formatDate } from 'src/utils';
import { validateDate } from 'src/utils/validation';
import { type endDateChanged, filterReset, type startDateChanged } from '../slice';

type DateChangedAction = typeof startDateChanged | typeof endDateChanged;

type ApplyToDatePartFn = (date: Date | null, dateChangedAction: DateChangedAction) => void;

interface UseFilterResult {
  initialStartDate: Date | null;
  initialEndDate: Date | null;
  isChanged: boolean;
  applyToDatePart: ApplyToDatePartFn;
  reset: () => void;
}

export const useFilter = (): UseFilterResult => {
  const [isInitialized, setIsInitialized] = useState(false);
  const filterStartDate = useAppSelector(state => state.pages.filter.startDate ?? null);
  const filterEndDate = useAppSelector(state => state.pages.filter.endDate ?? null);
  const isChanged = useAppSelector(state => state.pages.filter.changed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const initialStartDate = useMemo(
    () => (filterStartDate ? new Date(filterStartDate) : null),
    [filterStartDate],
  );

  const initialEndDate = useMemo(
    () => (filterEndDate ? new Date(filterEndDate) : null),
    [filterEndDate],
  );

  const reset = (): void => {
    dispatch(filterReset());
  };

  const applyToDatePart = useCallback<ApplyToDatePartFn>(
    (date, dateChangedAction) => {
      if (!isInitialized) {
        return;
      }

      if (!validateDate(date)) {
        return;
      }

      if (date === null) {
        dispatch(dateChangedAction());
        return;
      }

      dispatch(dateChangedAction(formatDate(date)));
    },
    [dispatch, isInitialized],
  );

  return {
    initialStartDate,
    initialEndDate,
    isChanged,
    applyToDatePart,
    reset,
  };
};
