import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLazySignInWithGoogleQuery } from 'src/api';

const Auth = () => {
  const [signInWithGoogle] = useLazySignInWithGoogleQuery();

  return (
    <GoogleLogin
      clientId="772368064111-19hqh3c6ksu56ke45nm24etn7qoma88v.apps.googleusercontent.com"
      onSuccess={response => {
        const { tokenId } = response as GoogleLoginResponse;
        signInWithGoogle(tokenId);
      }}
      cookiePolicy={'single_host_origin'}
    ></GoogleLogin>
  );
};

export default Auth;
