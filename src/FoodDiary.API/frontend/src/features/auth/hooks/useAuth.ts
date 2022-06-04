import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../__shared__/hooks';
import { userLoggedIn } from '../auth.slice';
import { getAccessToken } from '../cookie.service';

export type UseAuthHookResult = {
  isAuthenticated: boolean;
};

export default function useAuth(): UseAuthHookResult {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAccessToken();

    if (!isAuthenticated && token) {
      dispatch(userLoggedIn());
    }
  }, [dispatch, isAuthenticated]);

  return { isAuthenticated };
}
