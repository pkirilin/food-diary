import { type PropsWithChildren, type FC, useEffect } from 'react';
import { pageSizeChanged } from 'src/features/products/store';
import { useAppDispatch, type configureAppStore } from 'src/store';
import { actions } from '@/features/auth/store';

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
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (signOutAfterMilliseconds == null) {
      return;
    }

    const timeout = setTimeout(() => {
      dispatch(actions.signOut());
    }, signOutAfterMilliseconds);

    return () => {
      clearTimeout(timeout);
    };
  }, [dispatch, signOutAfterMilliseconds]);

  useEffect(() => {
    if (pageSizeOverride != null) {
      dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [dispatch, pageSizeOverride]);

  return <>{children}</>;
};

export default TestEnvironment;
