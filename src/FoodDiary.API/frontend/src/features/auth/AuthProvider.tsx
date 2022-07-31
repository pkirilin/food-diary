import React, { useState } from 'react';
import AuthContext from './AuthContext';

interface AuthProviderProps extends React.PropsWithChildren<unknown> {
  token?: string;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, token }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

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
