import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useReturnUrl } from '../hooks';

const Login: React.FC = () => {
  const returnUrl = useReturnUrl();
  const { user, isLoggingIn, login } = useAuth();

  function handleSignInWithGoogle() {
    login({ returnUrl });
  }

  if (user && user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (isLoggingIn) {
    return <React.Fragment>Logging in...</React.Fragment>;
  }

  return <button onClick={handleSignInWithGoogle}>Sign in with Google</button>;
};

export default Login;
