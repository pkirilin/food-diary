import { useEffect } from 'react';
import { AUTH_CHECK_INTERVAL, FAKE_AUTH_ENABLED } from 'src/config';
import { authApi } from '../api';

export default function useAuthProfileCheck(): void {
  const [getProfile] = authApi.useLazyGetProfileQuery();

  useEffect(() => {
    if (FAKE_AUTH_ENABLED) {
      return;
    }

    const interval = setInterval(() => {
      getProfile({});
    }, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [getProfile]);
}
