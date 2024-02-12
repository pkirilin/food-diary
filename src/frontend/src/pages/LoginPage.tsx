import { type FC } from 'react';
import { type LoaderFunction, redirect } from 'react-router-dom';
import { Login, authApi } from '@/features/auth';
import store from '@/store';

export const loader: LoaderFunction = async ({ request }) => {
  const authStatusPromise = store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  request.signal.onabort = () => {
    authStatusPromise.abort();
  };

  const authStatusQuery = await authStatusPromise;

  if (authStatusQuery.data?.isAuthenticated) {
    return redirect('/');
  }

  return {};
};

export const Component: FC = () => <Login />;
