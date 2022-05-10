import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '../../__shared__/hooks';
import { userLoggedIn } from '../auth.slice';
import { getAccessToken } from '../cookie.service';

export type UseAuthHookResult = {
  isAuthenticated: boolean;
};

export default function useAuth(): UseAuthHookResult {
  const isAuthenticated = useTypedSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAccessToken();

    if (!isAuthenticated && token) {
      dispatch(userLoggedIn());
    }
  }, [dispatch, isAuthenticated]);

  return { isAuthenticated };
}
