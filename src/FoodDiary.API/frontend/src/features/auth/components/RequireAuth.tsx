import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAuthProfileCheck } from '../hooks';
import { NavigationState } from '../types';

type RequireAuthProps = React.PropsWithChildren<unknown>;

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  useAuthProfileCheck();
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/login" replace state={state} />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default RequireAuth;
