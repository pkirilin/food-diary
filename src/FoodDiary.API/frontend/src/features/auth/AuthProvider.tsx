import React, { useState } from 'react';
import AuthContext from './AuthContext';

type AuthProviderProps = {
  withAuthentication?: boolean;
};

const AuthProvider: React.FC<React.PropsWithChildren<AuthProviderProps>> = ({
  children,
  withAuthentication,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!withAuthentication);

  function signIn() {
    setIsAuthenticated(true);
  }

  function signOut() {
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
