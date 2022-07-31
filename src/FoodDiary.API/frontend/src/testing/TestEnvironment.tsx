import React, { useState, useEffect } from 'react';
import AppProvider from 'src/AppProvider';
import { configureAppStore } from 'src/store';

type TestEnvironmentProps = {
  authToken?: string;
  removeTokenAfterMilliseconds?: number;
  store: ReturnType<typeof configureAppStore>;
};

const TestEnvironment: React.FC<React.PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  store,
  authToken,
  removeTokenAfterMilliseconds,
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

  return (
    <AppProvider store={store} authToken={token}>
      {children}
    </AppProvider>
  );
};

export default TestEnvironment;
