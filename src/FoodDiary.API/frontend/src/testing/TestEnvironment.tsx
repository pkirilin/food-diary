import React, { useEffect } from 'react';
import { useAuth } from 'src/features/auth';
import { pageSizeChanged } from 'src/features/products/store';
import { configureAppStore } from 'src/store';

type TestEnvironmentProps = {
  store: ReturnType<typeof configureAppStore>;
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
};

const TestEnvironment: React.FC<React.PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  store,
  signOutAfterMilliseconds,
  pageSizeOverride,
}) => {
  const { logout } = useAuth();

  useEffect(() => {
    if (!signOutAfterMilliseconds) {
      return;
    }

    const timeout = setTimeout(() => {
      logout();
    }, signOutAfterMilliseconds);

    return () => {
      clearTimeout(timeout);
    };
  }, [logout, signOutAfterMilliseconds]);

  useEffect(() => {
    if (pageSizeOverride) {
      store.dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [pageSizeOverride, store]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default TestEnvironment;
