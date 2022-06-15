import { Fragment, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'src/features/__shared__/hooks';

type RequireAuthProps = PropsWithChildren<unknown>;

export default function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Fragment>{children}</Fragment>;
}
