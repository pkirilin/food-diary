import { skipToken } from '@reduxjs/toolkit/dist/query';
import React, { useEffect, useState } from 'react';
import { API_URL, AUTH_CHECK_INTERVAL } from 'src/config';
import { useProfileQuery } from './api';
import AuthContext from './AuthContext';

type AuthProviderProps = {
  isAuthenticated: boolean;
  useFakeAuth?: boolean;
};

const AuthProvider: React.FC<React.PropsWithChildren<AuthProviderProps>> = ({
  children,
  isAuthenticated: isAuthenticatedInitial,
  useFakeAuth,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedInitial);

  function signIn() {
    setIsAuthenticated(true);
  }

  function signOut() {
    setIsAuthenticated(false);

    if (!useFakeAuth) {
      window.location.href = `${API_URL}/api/v1/account/logout`;
    }
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
  isAuthenticated?: boolean;
  useFakeAuth?: boolean;
};

const AuthProviderWrapper: React.FC<React.PropsWithChildren<AuthProviderWrapperProps>> = ({
  isAuthenticated,
  useFakeAuth,
  children,
}) => {
  const profileQueryArg = useFakeAuth ? skipToken : {};

  const {
    data: profileQueryData,
    isSuccess: isSuccessProfileQuery,
    refetch: refetchProfile,
  } = useProfileQuery(profileQueryArg);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchProfile();
    }, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [refetchProfile]);

  if (useFakeAuth) {
    return (
      <AuthProvider isAuthenticated={!!isAuthenticated} useFakeAuth={useFakeAuth}>
        {children}
      </AuthProvider>
    );
  }

  if (!isSuccessProfileQuery) {
    return <React.Fragment>Authenticating...</React.Fragment>;
  }

  return (
    <AuthProvider isAuthenticated={profileQueryData.isAuthenticated} useFakeAuth={useFakeAuth}>
      {children}
    </AuthProvider>
  );
};

export default AuthProviderWrapper;
