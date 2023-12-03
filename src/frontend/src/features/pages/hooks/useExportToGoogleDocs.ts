import format from 'date-fns/format';
import { useEffect } from 'react';
import { pagesApi } from '../api/pagesApi';
import { type UseExportResult } from '../types';

export const useExportToGoogleDocs = (
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult => {
  const [startExport, exportRequest] = pagesApi.useExportToGoogleDocsMutation();

  useEffect(() => {
    if (exportRequest.isSuccess) {
      onSuccess();
      exportRequest.reset();
    }
  }, [exportRequest, onSuccess]);

  const start = (): void => {
    if (startDate && endDate) {
      void startExport({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    }
  };

  return {
    isLoading: exportRequest.isLoading,
    start,
  };
};
