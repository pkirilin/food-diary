import { type FC, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks';
import AuthCallbackProgress from './AuthCallbackProgress';

const PostLogin: FC = () => {
  const { user, completeLogin } = useAuth();
  const params = useParams();

  useEffect(() => {
    completeLogin();
  }, [completeLogin]);

  if (user && user.isAuthenticated) {
    const redirectUrl = params.returnUrl ?? '/';
    return <Navigate to={redirectUrl} />;
  }

  return <AuthCallbackProgress label="Logging in..." />;
};

export default PostLogin;
