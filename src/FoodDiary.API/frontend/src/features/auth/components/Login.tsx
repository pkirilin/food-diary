import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { API_URL } from 'src/config';
import { useAuth } from '../hooks';
import { NavigationState } from '../types';

const Login: React.FC = () => {
  const location = useLocation();
  const returnUrl = (location.state as NavigationState)?.from?.pathname ?? '/';
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <form action={`${API_URL}/api/v1/account/login`} method="POST">
      <input type="hidden" name="returnUrl" value={returnUrl} />
      <input type="submit" value="Login with Google" />
    </form>
  );
};

export default Login;
