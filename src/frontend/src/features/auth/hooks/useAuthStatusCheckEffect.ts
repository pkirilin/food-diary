import { useEffect } from 'react';
import { AUTH_CHECK_INTERVAL } from '@/shared/config';
import { authApi } from '../api';
import { AUTH_STATUS_MAX_AGE_SECONDS } from '../constants';

export const useAuthStatusCheckEffect = (onSessionEnded: () => void): void => {
  const { data } = authApi.useGetStatusQuery({}, { pollingInterval: AUTH_CHECK_INTERVAL });
  const prefetchStatus = authApi.usePrefetch('getStatus', {
    ifOlderThan: AUTH_STATUS_MAX_AGE_SECONDS,
  });

  useEffect(() => {
    if (data?.isAuthenticated === false) {
      onSessionEnded();
    }
  }, [data, onSessionEnded]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        prefetchStatus({});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefetchStatus]);
};
