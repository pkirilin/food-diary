import { type FC } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthCallbackProgress, useAuth } from '@/features/auth';

export const Component: FC = () => {
  const auth = useAuth();

  if (!auth.status.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <AuthCallbackProgress label="Logging out..." />;
};
