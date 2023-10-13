import format from 'date-fns/format';
import { useEffect } from 'react';
import { useExportPagesToGoogleDocsMutation } from 'src/api';
import { UseExportResult } from '../types';

export function useExportToGoogleDocs(
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportResult {
  const [startExport, { isLoading, isSuccess, reset }] = useExportPagesToGoogleDocsMutation();

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      reset();
    }
  }, [isSuccess, onSuccess, reset]);

  function start() {
    if (startDate && endDate) {
      startExport({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    }
  }

  return {
    isLoading,
    start,
  };
}
