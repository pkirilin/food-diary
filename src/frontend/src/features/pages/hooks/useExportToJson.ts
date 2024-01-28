import { useEffect, useState } from 'react';
import { API_URL } from 'src/config';
import { createUrl, downloadFile, formatDate } from 'src/utils';
import { type ExportPagesToJsonRequest } from '../models';

interface UseExportToJsonResult {
  isLoading: boolean;
  start: () => Promise<void>;
}

export const useExportToJson = (
  startDate: Date | null,
  endDate: Date | null,
  onSuccess: () => void,
): UseExportToJsonResult => {
  const [exportFileDownloading, setExportFileDownloading] = useState(false);
  const [exportFileDownloaded, setExportFileDownloaded] = useState(false);

  useEffect(() => {
    if (exportFileDownloaded) {
      onSuccess();
      setExportFileDownloaded(false);
    }
  }, [exportFileDownloaded, onSuccess]);

  const start = async (): Promise<void> => {
    if (startDate && endDate) {
      try {
        setExportFileDownloading(true);

        const request: ExportPagesToJsonRequest = {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        };

        const url = createUrl(`${API_URL}/api/v1/exports/json`, { ...request });
        const response = await fetch(url);

        if (!response.ok) {
          setExportFileDownloading(false);
          setExportFileDownloaded(false);
          return;
        }

        const blob = await response.blob();
        downloadFile(blob, `FoodDiary_${request.startDate}_${request.endDate}.json`);
        setExportFileDownloaded(true);
      } catch (error) {
        setExportFileDownloaded(false);
      } finally {
        setExportFileDownloading(false);
      }
    }
  };

  return {
    isLoading: exportFileDownloading,
    start,
  };
};
