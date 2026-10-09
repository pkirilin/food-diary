import { type FC, useEffect } from 'react';
import { AuthCallbackProgress, type NavigateToHref, useAuth } from '@/features/auth';

interface Props {
  returnUrl: string;
  navigate: NavigateToHref;
}

export const PostLoginPage: FC<Props> = ({ returnUrl, navigate }) => {
  const { isAuthenticated } = useAuth().status;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  if (isAuthenticated) {
    return null;
  }

  return <AuthCallbackProgress label="Logging in..." />;
};
