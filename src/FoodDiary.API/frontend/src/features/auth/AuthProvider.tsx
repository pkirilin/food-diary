import { PropsWithChildren, useState } from 'react';
import AuthContext from './AuthContext';
import { getAccessToken } from './cookie.service';

const token = getAccessToken();

type AuthProviderProps = PropsWithChildren<unknown>;

export default function AuthProvider({ children }: AuthProviderProps) {
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
