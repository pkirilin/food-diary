import { useAppSelector } from '../../__shared__/hooks';

export type UseAuthHookResult = {
  isAuthenticated: boolean;
};

export default function useAuth(): UseAuthHookResult {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return { isAuthenticated };
}
