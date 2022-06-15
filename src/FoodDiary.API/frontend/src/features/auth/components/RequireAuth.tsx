import { Fragment, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'src/features/__shared__/hooks';
import { NavigationState } from '../types';

type RequireAuthProps = PropsWithChildren<unknown>;

export default function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/auth" state={state} replace />;
  }

  return <Fragment>{children}</Fragment>;
}
