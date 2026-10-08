import { type FC } from 'react';
import { type LoaderFunction, redirect, useNavigate, useSearchParams } from 'react-router';
import { authApi, getInAppReturnUrl } from '@/features/auth';
import { LoginPage } from '@/pages/ui/LoginPage';
import { store } from '../store';
import { ok } from './reactRouterExtensions';

export const loader: LoaderFunction = async () => {
  const authStatusQueryPromise = store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  try {
    const authStatusQuery = await authStatusQueryPromise;

    if (authStatusQuery.data?.isAuthenticated) {
      return redirect('/');
    }

    return ok();
  } finally {
    authStatusQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return <LoginPage returnUrl={getInAppReturnUrl(searchParams)} navigate={navigate} />;
};
