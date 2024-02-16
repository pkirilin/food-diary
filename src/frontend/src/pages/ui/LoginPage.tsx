import { type FC } from 'react';
import { type LoaderFunction, redirect } from 'react-router-dom';
import { ok } from '../lib';
import { Login, authApi } from '@/features/auth';
import store from '@/store';

export const loader: LoaderFunction = async () => {
  const getAuthStatusQuery = await store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  if (getAuthStatusQuery.data?.isAuthenticated) {
    return redirect('/');
  }

  return ok();
};

export const Component: FC = () => <Login />;
