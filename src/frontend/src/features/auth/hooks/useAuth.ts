import { useCallback } from 'react';
import { useAppSelector } from 'src/hooks';
import { authApi } from '../api';
import { type AuthUserState } from '../store/types';

interface UseAuthHookResult {
  user?: AuthUserState;
  completeLogin: () => void;
  completeLogout: () => void;
}

export const useAuth = (): UseAuthHookResult => {
  const user = useAppSelector(state => state.auth.user);
  const [getStatus] = authApi.useLazyGetStatusQuery();

  const completeLogin = useCallback(() => {
    void getStatus({});
  }, [getStatus]);

  const completeLogout = useCallback(() => {
    void getStatus({});
  }, [getStatus]);

  return {
    user,
    completeLogin,
    completeLogout,
  };
};
