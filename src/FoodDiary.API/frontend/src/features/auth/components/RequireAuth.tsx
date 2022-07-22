import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';

type RequireAuthProps = React.PropsWithChildren<unknown>;

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/auth" state={state} replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default RequireAuth;
