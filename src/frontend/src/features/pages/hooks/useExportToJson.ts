import format from 'date-fns/format';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/features/__shared__/hooks';
import { exportToJsonFinished } from '../slice';
import { exportPagesToJson } from '../thunks';
import { UseExportResult } from '../types';

export function useExportToJson(
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult {
  const isLoading = useAppSelector(state => state.pages.isExportToJsonLoading);
  const isSuccess = useAppSelector(state => state.pages.isExportToJsonSuccess);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      dispatch(exportToJsonFinished());
    }
  }, [dispatch, isSuccess, onSuccess]);

  function start() {
    if (startDate && endDate) {
      dispatch(
        exportPagesToJson({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        }),
      );
    }
  }

  return {
    isLoading,
    start,
  };
}
