import { type FC } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { AuthCallbackProgress, getInAppReturnUrl, useAuth } from '@/features/auth';

export const Component: FC = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  if (auth.status.isAuthenticated) {
    return <Navigate to={getInAppReturnUrl(searchParams)} />;
  }

  return <AuthCallbackProgress label="Logging in..." />;
};
