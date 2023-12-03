import { type FC, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import AuthCallbackProgress from './AuthCallbackProgress';

const PostLogout: FC = () => {
  const { user, completeLogout } = useAuth();

  useEffect(() => {
    completeLogout();
  }, [completeLogout]);

  if (user && !user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <AuthCallbackProgress label="Logging out..." />;
};

export default PostLogout;
