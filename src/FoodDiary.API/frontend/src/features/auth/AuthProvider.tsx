import React, { useState } from 'react';
import AuthContext, { SignInOptions } from './AuthContext';
import { removeToken, saveToken } from './utils';

type AuthProviderProps = {
  token?: string;
};

const AuthProvider: React.FC<React.PropsWithChildren<AuthProviderProps>> = ({
  children,
  token,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  function signIn({ token, expiresAtUnixMilliseconds }: SignInOptions) {
    saveToken({
      token,
      expiresAtUnixMilliseconds,
    });

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
