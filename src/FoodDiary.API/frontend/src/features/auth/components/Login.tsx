import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useReturnUrl } from '../hooks';

const Login: React.FC = () => {
  const returnUrl = useReturnUrl();
  const { isAuthenticated, signIn } = useAuth();

  function handleSignInWithGoogle() {
    signIn({ returnUrl });
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <button onClick={handleSignInWithGoogle}>Sign in with Google</button>;
};

export default Login;
