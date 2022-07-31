import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { TOKEN_CHECK_INTERVAL } from 'src/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';
import { getToken } from '../utils';

type RequireAuthProps = React.PropsWithChildren<unknown>;

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();

      if (!token) {
        signOut();
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [signOut]);

  if (!isAuthenticated) {
    const state: NavigationState = { from: location };
    return <Navigate to="/auth" state={state} replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default RequireAuth;
