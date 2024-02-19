import { useEffect } from 'react';
import { useSubmit } from 'react-router-dom';
import { AUTH_CHECK_INTERVAL } from 'src/config';
import { authApi } from '../api';

export const useAuthStatusCheckEffect = (): void => {
  const [getAuthStatus] = authApi.useLazyGetStatusQuery();
  const submit = useSubmit();

  useEffect(() => {
    const interval = setInterval(() => {
      void (async () => {
        const authStatus = await getAuthStatus({});

        if (!authStatus.data?.isAuthenticated) {
          submit(null, { method: 'post', action: '/logout' });
        }
      })();
    }, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [getAuthStatus, submit]);
};
