import { useTypedSelector } from '../../__shared__/hooks';
import { getAccessToken } from '../cookie.service';

export type UseAuthHookResult = {
  isAuthenticated: boolean;
};

export default function useAuth(): UseAuthHookResult {
  const token = getAccessToken();
  const isAuthenticated = useTypedSelector(state => state.auth.isAuthenticated);

  return {
    isAuthenticated: !!isAuthenticated && !!token,
  };
}
