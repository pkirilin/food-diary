import React from 'react';
import { API_URL } from 'src/config';

const Login: React.FC = () => {
  return (
    <form action={`${API_URL}/api/v1/account/login`} method="POST">
      <input type="submit" value="Login with Google" />
    </form>
  );
};

export default Login;
