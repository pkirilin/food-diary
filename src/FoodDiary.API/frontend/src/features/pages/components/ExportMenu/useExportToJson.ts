import { useEffect } from 'react';
import format from 'date-fns/format';
import { UseExportResult } from './types';
import { exportPagesToJson } from '../../thunks';
import { exportToJsonFinished } from '../../slice';
import { useAppDispatch, useTypedSelector } from 'src/features/__shared__/hooks';

export function useExportToJson(
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult {
  const isLoading = useTypedSelector(state => state.pages.isExportToJsonLoading);
  const isSuccess = useTypedSelector(state => state.pages.isExportToJsonSuccess);
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
