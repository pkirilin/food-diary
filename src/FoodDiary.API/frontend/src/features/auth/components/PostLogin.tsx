import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks';
import AuthCallbackProgress from './AuthCallbackProgress';

const PostLogin: React.FC = () => {
  const { user, executePostLogin } = useAuth();
  const params = useParams();

  useEffect(() => {
    executePostLogin();
  }, [executePostLogin]);

  if (user && user.isAuthenticated) {
    const redirectUrl = params['returnUrl'] ?? '/';
    return <Navigate to={redirectUrl} />;
  }

  return <AuthCallbackProgress label="Logging in..." />;
};

export default PostLogin;
