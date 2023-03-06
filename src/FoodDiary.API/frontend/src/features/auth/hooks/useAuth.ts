import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useCallback } from 'react';
import { API_URL } from 'src/config';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { createUrl } from 'src/utils';
import { useProfileQuery } from '../api';
import { USE_FAKE_AUTH } from '../constants';
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
  completeLogin: () => void;
  completeLogout: () => void;
};

export default function useAuth(): UseAuthHookResult {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const { isFetching: isProfileFetching, refetch: refetchProfile } = useProfileQuery(
    USE_FAKE_AUTH ? skipToken : {},
  );

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
        const loginUrl = createUrl(`${API_URL}/api/v1/auth/login`, { returnUrl });
        window.location.href = loginUrl;
      }
    },
    [signIn],
  );

  const logout = useCallback(() => {
    if (USE_FAKE_AUTH) {
      signOut();
    } else {
      const logoutUrl = `${API_URL}/api/v1/auth/logout`;
      window.location.href = logoutUrl;
    }
  }, [signOut]);

  return {
    user,
    isLoggingIn: isProfileFetching,
    login,
    logout,
    completeLogin: refetchProfile,
    completeLogout: refetchProfile,
  };
}
