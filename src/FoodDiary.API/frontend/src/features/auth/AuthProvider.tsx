import React, { useState } from 'react';
import AuthContext from './AuthContext';
import { removeToken } from './utils';

type AuthProviderProps = {
  token?: string;
};

const AuthProvider: React.FC<React.PropsWithChildren<AuthProviderProps>> = ({
  children,
  token,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  function signIn() {
    setIsAuthenticated(true);
  }

  function signOut() {
    removeToken();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
