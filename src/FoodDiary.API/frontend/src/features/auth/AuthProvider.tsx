import { PropsWithChildren, useState } from 'react';
import AuthContext from './AuthContext';

type AuthProviderProps = PropsWithChildren<unknown>;

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
