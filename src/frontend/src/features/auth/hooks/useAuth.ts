import { useCallback } from 'react';
import { API_URL, FAKE_AUTH_ENABLED } from 'src/config';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { createUrl } from 'src/utils';
import { authApi } from '../api';
import { actions } from '../store';
import { type AuthUserState } from '../store/types';

interface LoginOptions {
  returnUrl?: string;
}

interface UseAuthHookResult {
  user?: AuthUserState;
  isLoggingIn: boolean;
  login: (options: LoginOptions) => void;
  logout: () => void;
  completeLogin: () => void;
  completeLogout: () => void;
}

export default function useAuth(): UseAuthHookResult {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const { refetch, isFetching } = authApi.useGetStatusQuery(
    {},
    {
      skip: !!user,
    },
  );

  const signIn = useCallback(() => {
    dispatch(actions.signIn());
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(actions.signOut());
  }, [dispatch]);

  const login = useCallback(
    ({ returnUrl }: LoginOptions) => {
      if (FAKE_AUTH_ENABLED) {
        signIn();
      } else {
        const loginUrl = createUrl(`${API_URL}/api/v1/auth/login`, { returnUrl });
        window.location.href = loginUrl;
      }
    },
    [signIn],
  );

  const logout = useCallback(() => {
    if (FAKE_AUTH_ENABLED) {
      signOut();
    } else {
      const logoutUrl = `${API_URL}/api/v1/auth/logout`;
      window.location.href = logoutUrl;
    }
  }, [signOut]);

  const completeLogin = useCallback(() => {
    void refetch();
  }, [refetch]);

  const completeLogout = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    user,
    isLoggingIn: isFetching,
    login,
    logout,
    completeLogin,
    completeLogout,
  };
}
