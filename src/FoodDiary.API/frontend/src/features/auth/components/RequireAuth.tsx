import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { TOKEN_CHECK_INTERVAL } from 'src/config';
import { useAuth } from '../hooks';

type RequireAuthProps = React.PropsWithChildren<unknown>;

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // TODO: implement checking user status
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: implement checking user status
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default RequireAuth;
