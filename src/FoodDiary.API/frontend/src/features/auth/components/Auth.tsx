import { useEffect } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLocation, useNavigate } from 'react-router-dom';
import config from 'src/features/__shared__/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';
import { saveToken } from '../utils';

const Auth = () => {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = (location.state as NavigationState)?.from?.pathname || '/';
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  return (
    <GoogleLogin
      clientId={config.googleClientId}
      onSuccess={response => {
        const { tokenId, tokenObj } = response as GoogleLoginResponse;

        saveToken({
          token: tokenId,
          expiresAtUnixMilliseconds: tokenObj.expires_at,
        });

        signIn();
      }}
      cookiePolicy={'single_host_origin'}
    />
  );
};

export default Auth;
