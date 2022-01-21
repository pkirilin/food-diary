import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { useDispatch } from 'react-redux';
import authApi from '../auth.api';

const Auth = () => {
  const dispatch = useDispatch();

  return (
    <GoogleLogin
      clientId="772368064111-19hqh3c6ksu56ke45nm24etn7qoma88v.apps.googleusercontent.com"
      onSuccess={response => {
        const { tokenId } = response as GoogleLoginResponse;
        dispatch(authApi.endpoints.signInWithGoogle.initiate(tokenId));
      }}
      cookiePolicy={'single_host_origin'}
    ></GoogleLogin>
  );
};

export default Auth;
