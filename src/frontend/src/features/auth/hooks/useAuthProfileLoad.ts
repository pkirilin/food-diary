import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks';
import { authApi } from '../api';
import { USE_FAKE_AUTH, USE_FAKE_AUTH_DEV } from '../constants';
import { actions } from '../store';

const ROUTES_WITHOUT_AUTH = ['/login', '/post-login'];

export default function useAuthProfileLoad(): void {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const getProfileQuery = authApi.useGetProfileQuery(USE_FAKE_AUTH ? skipToken : {});

  const signIn = useCallback(() => {
    dispatch(actions.signIn());
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(actions.signOut());
  }, [dispatch]);

  useEffect(() => {
    if (
      getProfileQuery.isError ||
      (getProfileQuery.isSuccess && !getProfileQuery.data.isAuthenticated)
    ) {
      signOut();
    } else if (getProfileQuery.isSuccess && getProfileQuery.data.isAuthenticated) {
      signIn();
    }
  }, [
    getProfileQuery.data?.isAuthenticated,
    getProfileQuery.isError,
    getProfileQuery.isSuccess,
    signIn,
    signOut,
  ]);

  useEffect(() => {
    if (USE_FAKE_AUTH_DEV) {
      const isPublicRoute = ROUTES_WITHOUT_AUTH.some(route => location.pathname.startsWith(route));

      if (isPublicRoute) {
        signOut();
      } else {
        signIn();
      }
    }
  }, [location, signIn, signOut]);
}
