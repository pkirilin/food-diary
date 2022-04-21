import { useDispatch, useSelector } from 'react-redux';
import format from 'date-fns/format';
import { exportPagesToJson } from '../../thunks';

export type UseExportToJsonResult = {
  isLoading: boolean;
  isSuccess: boolean;
  start: () => void;
};

export function useExportToJson(
  startDate: Date | null,
  endDate: Date | null,
): UseExportToJsonResult {
  const isLoading = useSelector(state => state.pages.isExportToJsonLoading);
  const isSuccess = useSelector(state => state.pages.isExportToJsonSuccess);
  const dispatch = useDispatch();

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
    isSuccess,
    start,
  };
}
