import React, { useState, useEffect } from 'react';
import AppProvider from 'src/AppProvider';
import { pageSizeChanged } from 'src/features/products/slice';
import { configureAppStore } from 'src/store';

type TestEnvironmentProps = {
  authToken?: string;
  removeTokenAfterMilliseconds?: number;
  pageSizeOverride?: number;
  store: ReturnType<typeof configureAppStore>;
};

const TestEnvironment: React.FC<React.PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  store,
  authToken,
  removeTokenAfterMilliseconds,
  pageSizeOverride,
}) => {
  const [token, setToken] = useState(authToken);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (removeTokenAfterMilliseconds) {
      timer = setTimeout(() => {
        setToken(undefined);
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
    <AppProvider store={store} authToken={token}>
      {children}
    </AppProvider>
  );
};

export default TestEnvironment;
