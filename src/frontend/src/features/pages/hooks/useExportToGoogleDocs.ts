import format from 'date-fns/format';
import { useEffect } from 'react';
import { pagesApi } from '../api/pagesApi';
import { UseExportResult } from '../types';

export function useExportToGoogleDocs(
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult {
  const [startExport, exportRequest] = pagesApi.useExportToGoogleDocsMutation();

  useEffect(() => {
    if (exportRequest.isSuccess) {
      onSuccess();
      exportRequest.reset();
    }
  }, [exportRequest, onSuccess]);

  function start() {
    if (startDate && endDate) {
      startExport({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    }
  }

  return {
    isLoading: exportRequest.isLoading,
    start,
  };
}
