import { type FC } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AuthCallbackProgress, useAuth } from '@/features/auth';

export const Component: FC = () => {
  const auth = useAuth();
  const params = useParams();

  if (auth.status.isAuthenticated) {
    const redirectUrl = params.returnUrl ?? '/';
    return <Navigate to={redirectUrl} />;
  }

  return <AuthCallbackProgress label="Logging in..." />;
};
