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
  const { signOut } = useAuth();

  useEffect(() => {
    if (!signOutAfterMilliseconds) {
      return;
    }

    const timeout = setTimeout(() => {
      signOut();
    }, signOutAfterMilliseconds);

    return () => {
      clearTimeout(timeout);
    };
  }, [signOut, signOutAfterMilliseconds]);

  useEffect(() => {
    if (pageSizeOverride) {
      store.dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [pageSizeOverride, store]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default TestEnvironment;
