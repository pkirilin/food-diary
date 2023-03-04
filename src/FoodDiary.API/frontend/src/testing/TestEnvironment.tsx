import React, { useState, useEffect } from 'react';
import AppProvider from 'src/AppProvider';
import { pageSizeChanged } from 'src/features/products/store';
import { configureAppStore } from 'src/store';

type TestEnvironmentProps = {
  withAuthentication?: boolean;
  removeTokenAfterMilliseconds?: number;
  pageSizeOverride?: number;
  store: ReturnType<typeof configureAppStore>;
};

const TestEnvironment: React.FC<React.PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  store,
  withAuthentication,
  removeTokenAfterMilliseconds,
  pageSizeOverride,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(withAuthentication);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (removeTokenAfterMilliseconds) {
      timer = setTimeout(() => {
        setIsAuthenticated(false);
      }, removeTokenAfterMilliseconds);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [removeTokenAfterMilliseconds]);

  useEffect(() => {
    if (pageSizeOverride) {
      store.dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [pageSizeOverride, store]);

  return (
    <AppProvider store={store} withAuthentication={isAuthenticated} useFakeAuth>
      {children}
    </AppProvider>
  );
};

export default TestEnvironment;
