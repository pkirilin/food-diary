import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import format from 'date-fns/format';
import { UseExportResult } from './types';
import { exportPagesToJson } from '../../thunks';
import { exportToJsonFinished } from '../../slice';

export function useExportToJson(
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult {
  const isLoading = useSelector(state => state.pages.isExportToJsonLoading);
  const isSuccess = useSelector(state => state.pages.isExportToJsonSuccess);
  const dispatch = useDispatch();

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
