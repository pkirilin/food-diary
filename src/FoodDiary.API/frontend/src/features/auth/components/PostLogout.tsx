import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';

const PostLogout: React.FC = () => {
  const { user, executePostLogout } = useAuth();

  useEffect(() => {
    executePostLogout();
  }, [executePostLogout]);

  if (user && !user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <React.Fragment>Logging out...</React.Fragment>;
};

export default PostLogout;
