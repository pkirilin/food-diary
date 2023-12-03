import { type PropsWithChildren, type FC, useEffect } from 'react';
import { useAuth } from 'src/features/auth';
import { pageSizeChanged } from 'src/features/products/store';
import { type configureAppStore } from 'src/store';

interface TestEnvironmentProps {
  store: ReturnType<typeof configureAppStore>;
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
}

const TestEnvironment: FC<PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  store,
  signOutAfterMilliseconds,
  pageSizeOverride,
}) => {
  const { logout } = useAuth();

  useEffect(() => {
    if (signOutAfterMilliseconds == null) {
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
    if (pageSizeOverride != null) {
      store.dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [pageSizeOverride, store]);

  return <>{children}</>;
};

export default TestEnvironment;
