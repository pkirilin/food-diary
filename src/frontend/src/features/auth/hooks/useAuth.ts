import { useCallback } from 'react';
import { API_URL, FAKE_AUTH_ENABLED } from 'src/config';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { authApi } from '../api';
import { actions } from '../store';
import { type AuthUserState } from '../store/types';

interface UseAuthHookResult {
  user?: AuthUserState;
  logout: () => void;
  completeLogin: () => void;
  completeLogout: () => void;
}

export const useAuth = (): UseAuthHookResult => {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const [getStatus] = authApi.useLazyGetStatusQuery();

  const signOut = useCallback(() => {
    dispatch(actions.signOut());
  }, [dispatch]);

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
    logout,
    completeLogin,
    completeLogout,
  };
};
