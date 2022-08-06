import React, { useEffect } from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useLocation, useNavigate } from 'react-router-dom';
import { GOOGLE_CLIENT_ID } from 'src/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';

const Auth: React.FC = () => {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = (location.state as NavigationState)?.from?.pathname || '/';
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  function handleGoogleLoginSuccess(response: GoogleLoginResponse | GoogleLoginResponseOffline) {
    const { tokenId, tokenObj } = response as GoogleLoginResponse;

    signIn({
      token: tokenId,
      expiresAtUnixMilliseconds: tokenObj.expires_at,
    });
  }

  return (
    <GoogleLogin
      clientId={GOOGLE_CLIENT_ID}
      onSuccess={handleGoogleLoginSuccess}
      cookiePolicy={'single_host_origin'}
      scope="openid profile email"
    />
  );
};

export default Auth;
