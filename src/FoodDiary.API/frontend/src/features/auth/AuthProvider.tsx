import React, { useEffect, useState } from 'react';
import { TOKEN_CHECK_INTERVAL } from 'src/config';
import { useProfileQuery } from './api';
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

type AuthProviderWrapperProps = {
  withAuthentication?: boolean;
};

const AuthProviderWrapper: React.FC<React.PropsWithChildren<AuthProviderWrapperProps>> = ({
  withAuthentication,
  children,
}) => {
  const {
    data,
    isSuccess,
    refetch: refetchProfile,
  } = useProfileQuery(
    {},
    {
      skip: withAuthentication !== undefined,
    },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetchProfile();
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [refetchProfile]);

  if (withAuthentication !== undefined) {
    return <AuthProvider withAuthentication={withAuthentication}>{children}</AuthProvider>;
  }

  if (!isSuccess) {
    return <React.Fragment>Authenticating...</React.Fragment>;
  }

  return <AuthProvider withAuthentication={data.isAuthenticated}>{children}</AuthProvider>;
};

export default AuthProviderWrapper;
