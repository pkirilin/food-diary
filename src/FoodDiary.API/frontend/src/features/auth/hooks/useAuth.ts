import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useCallback, useEffect } from 'react';
import { API_URL, AUTH_CHECK_INTERVAL } from 'src/config';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { createUrl } from 'src/utils';
import { useProfileQuery } from '../api';
import { actions } from '../store';
import { AuthUserState } from '../store/types';

type LoginOptions = {
  returnUrl?: string;
};

type UseAuthHookResult = {
  user?: AuthUserState;
  isLoggingIn: boolean;
  login: (options: LoginOptions) => void;
  logout: () => void;
  executePostLogin: () => void;
  executePostLogout: () => void;
};

const USE_FAKE_AUTH =
  process.env.NODE_ENV === 'test' ||
  (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MSW_ENABLED === 'true');

export default function useAuth(): UseAuthHookResult {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const {
    data: profile,
    isSuccess: isProfileSuccess,
    isError: isProfileError,
    isFetching: isLoadingProfile,
    refetch: refetchProfile,
  } = useProfileQuery(USE_FAKE_AUTH ? skipToken : {});

  const signIn = useCallback(() => {
    dispatch(actions.signIn());
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(actions.signOut());
  }, [dispatch]);

  const login = useCallback(
    ({ returnUrl }: LoginOptions) => {
      if (USE_FAKE_AUTH) {
        signIn();
      } else {
        const loginUrl = createUrl(`${API_URL}/api/v1/account/login`, { returnUrl });
        window.location.href = loginUrl;
      }
    },
    [signIn],
  );

  const logout = useCallback(() => {
    if (USE_FAKE_AUTH) {
      signOut();
    } else {
      const logoutUrl = `${API_URL}/api/v1/account/logout`;
      window.location.href = logoutUrl;
    }
  }, [signOut]);

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

  useEffect(() => {
    if (isProfileError || (isProfileSuccess && !profile.isAuthenticated)) {
      signOut();
    } else if (isProfileSuccess && profile.isAuthenticated) {
      signIn();
    }
  }, [isProfileError, isProfileSuccess, profile?.isAuthenticated, signIn, signOut]);

  return {
    user,
    isLoggingIn: isLoadingProfile,
    login,
    logout,
    executePostLogin: refetchProfile,
    executePostLogout: refetchProfile,
  };
}
