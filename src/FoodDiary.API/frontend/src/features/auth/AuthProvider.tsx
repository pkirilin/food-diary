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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
