import { useEffect } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazySignInWithGoogleQuery } from 'src/api';
import config from 'src/features/__shared__/config';
import { useAppSelector } from 'src/features/__shared__/hooks';

const Auth = () => {
  const [signInWithGoogle] = useLazySignInWithGoogleQuery();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirectUrl = (location.state as any)?.from?.pathname || '/';

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
        signInWithGoogle(tokenId);
      }}
      cookiePolicy={'single_host_origin'}
    ></GoogleLogin>
  );
};

export default Auth;
