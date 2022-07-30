import { useEffect, useState } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazySignInWithGoogleQuery } from 'src/api';
import config from 'src/features/__shared__/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';
import { saveToken } from '../utils';

const Auth = () => {
  const [signInWithGoogle, { isSuccess: isSignInWithGoogleSuccess, data: signInWithGoogleResult }] =
    useLazySignInWithGoogleQuery();
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = (location.state as NavigationState)?.from?.pathname || '/';
  const [tokenId, setTokenId] = useState<string>();

  useEffect(() => {
    if (tokenId) {
      signInWithGoogle(tokenId);
    }
  }, [signInWithGoogle, tokenId]);

  useEffect(() => {
    if (isSignInWithGoogleSuccess && signInWithGoogleResult) {
      saveToken(signInWithGoogleResult);
      signIn();
    }
  }, [isSignInWithGoogleSuccess, signIn, signInWithGoogleResult]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [redirectUrl, isAuthenticated, navigate]);

  return (
    <GoogleLogin
      clientId={config.googleClientId}
      onSuccess={response => {
        const { tokenId } = response as GoogleLoginResponse;
        setTokenId(tokenId);
      }}
      cookiePolicy={'single_host_origin'}
    />
  );
};

export default Auth;
