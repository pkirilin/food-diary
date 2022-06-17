import { useEffect } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazySignInWithGoogleQuery } from 'src/api';
import config from 'src/features/__shared__/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';

const Auth = () => {
  const [signInWithGoogle, { isSuccess }] = useLazySignInWithGoogleQuery();
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = (location.state as NavigationState)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [redirectUrl, isAuthenticated, navigate]);

  useEffect(() => {
    if (isSuccess) {
      signIn();
    }
  }, [isSuccess, signIn]);

  return (
    <GoogleLogin
      clientId={config.googleClientId}
      onSuccess={response => {
        const { tokenId } = response as GoogleLoginResponse;
        signInWithGoogle(tokenId);
      }}
      cookiePolicy={'single_host_origin'}
    ></GoogleLogin>
  );
};

export default Auth;
