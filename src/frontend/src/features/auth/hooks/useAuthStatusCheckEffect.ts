import { useEffect } from 'react';
import { AUTH_CHECK_INTERVAL } from '@/shared/config';
import { authApi } from '../api';
import { type NavigateToHref, signOut } from '../lib';

export const useAuthStatusCheckEffect = (navigate: NavigateToHref): void => {
  const [getAuthStatus] = authApi.useLazyGetStatusQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      void (async () => {
        const authStatus = await getAuthStatus({});

        if (!authStatus.data?.isAuthenticated) {
          await signOut(navigate);
        }
      })();
    }, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [getAuthStatus, navigate]);
};
