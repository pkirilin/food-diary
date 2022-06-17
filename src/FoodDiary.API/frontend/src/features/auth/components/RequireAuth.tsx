import { Fragment, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';

type RequireAuthProps = PropsWithChildren<unknown>;

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/auth" state={state} replace />;
  }

  return <Fragment>{children}</Fragment>;
}
