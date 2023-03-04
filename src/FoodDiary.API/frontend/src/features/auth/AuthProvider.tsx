import { skipToken } from '@reduxjs/toolkit/dist/query';
import React, { useEffect, useState } from 'react';
import { API_URL, AUTH_CHECK_INTERVAL } from 'src/config';
import { createUrl } from '../__shared__/utils';
import { useProfileQuery } from './api';
import AuthContext, { SignInContext } from './AuthContext';

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

  function signIn({ returnUrl }: SignInContext) {
    if (useFakeAuth) {
      setIsAuthenticated(true);
    } else {
      const loginUrl = createUrl(`${API_URL}/api/v1/account/login`, { returnUrl });
      window.location.href = loginUrl;
    }
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
