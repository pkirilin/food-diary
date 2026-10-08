import { type FC, useEffect } from 'react';
import { AuthCallbackProgress, type NavigateToHref, useAuth } from '@/features/auth';

interface Props {
  navigate: NavigateToHref;
}

export const PostLogoutPage: FC<Props> = ({ navigate }) => {
  const { isAuthenticated } = useAuth().status;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <AuthCallbackProgress label="Logging out..." />;
};
