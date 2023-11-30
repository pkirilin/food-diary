import { type FC, type PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAuthProfileCheck } from '../hooks';
import { type NavigationState } from '../types';

type RequireAuthProps = PropsWithChildren<unknown>;

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  useAuthProfileCheck();

  if (!user) {
    return null;
  }

  if (!user.isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/login" replace state={state} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
