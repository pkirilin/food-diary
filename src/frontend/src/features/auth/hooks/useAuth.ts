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
  login: (options: LoginOptions) => void;
  logout: () => void;
  completeLogin: () => void;
  completeLogout: () => void;
}

export const useAuth = (): UseAuthHookResult => {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const [getStatus] = authApi.useLazyGetStatusQuery();

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
    void getStatus({});
  }, [getStatus]);

  const completeLogout = useCallback(() => {
    void getStatus({});
  }, [getStatus]);

  return {
    user,
    login,
    logout,
    completeLogin,
    completeLogout,
  };
};
