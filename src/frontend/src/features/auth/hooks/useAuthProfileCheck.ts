import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useEffect } from 'react';
import { AUTH_CHECK_INTERVAL } from 'src/config';
import { authApi } from '../api';
import { USE_FAKE_AUTH } from '../constants';

export default function useAuthProfileCheck(): void {
  const { refetch: refetchProfile } = authApi.useGetProfileQuery(USE_FAKE_AUTH ? skipToken : {});

  useEffect(() => {
    if (USE_FAKE_AUTH) {
      return;
    }

    const interval = setInterval(() => {
      refetchProfile();
    }, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [refetchProfile]);
}
