import { PropsWithChildren, useState } from 'react';
import AuthContext from './AuthContext';

interface AuthProviderProps extends PropsWithChildren<unknown> {
  token?: string;
}

export default function AuthProvider({ children, token }: AuthProviderProps) {
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
}
