import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';
import format from 'date-fns/format';
import { UseExportResult } from './types';
import { useLazyExportPagesToGoogleDocsQuery } from 'src/api';
import config from 'src/features/__shared__/config';

export function useExportToGoogleDocs(
  startDate: Date | null,
  endDate: Date | null,
): UseExportResult {
  const [startExport, { isLoading, isSuccess }] = useLazyExportPagesToGoogleDocsQuery();

  const { signIn } = useGoogleLogin({
    clientId: config.googleClientId,
    onSuccess: response => {
      if (startDate && endDate) {
        const { accessToken } = response as GoogleLoginResponse;
        startExport({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          accessToken,
        });
      }
    },
    scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive',
  });

  function start() {
    signIn();
  }

  return {
    isLoading,
    isSuccess,
    start,
  };
}
