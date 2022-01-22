import { getAccessToken } from '../cookie.service';

export type UseAuthHookResult = {
  isAuthenticated: boolean;
};

export default function useAuth(): UseAuthHookResult {
  const token = getAccessToken();

  return {
    isAuthenticated: !!token,
  };
}
