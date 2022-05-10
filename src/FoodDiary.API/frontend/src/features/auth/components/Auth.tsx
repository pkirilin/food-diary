import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useLazySignInWithGoogleQuery } from 'src/api';
import config from 'src/features/__shared__/config';

const Auth = () => {
  const [signInWithGoogle] = useLazySignInWithGoogleQuery();

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
