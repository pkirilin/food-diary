import format from 'date-fns/format';
import { useEffect } from 'react';
import { pagesApi } from '../api/pagesApi';

interface UseExportToGoogleDocsResult {
  isLoading: boolean;
  start: () => Promise<void>;
}

export const useExportToGoogleDocs = (
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportToGoogleDocsResult => {
  const [startExport, exportRequest] = pagesApi.useExportToGoogleDocsMutation();

  useEffect(() => {
    if (exportRequest.isSuccess) {
      onSuccess();
      exportRequest.reset();
    }
  }, [exportRequest, onSuccess]);

  const start = async (): Promise<void> => {
    if (startDate && endDate) {
      await startExport({
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
