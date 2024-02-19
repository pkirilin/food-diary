import { type PropsWithChildren, type FC, useEffect } from 'react';
import { useSubmit } from 'react-router-dom';
import { pageSizeChanged } from 'src/features/products/store';
import { useAppDispatch } from 'src/store';

interface TestEnvironmentProps {
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
}

const TestEnvironment: FC<PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  signOutAfterMilliseconds,
  pageSizeOverride,
}) => {
  const dispatch = useAppDispatch();
  const submit = useSubmit();

  useEffect(() => {
    if (signOutAfterMilliseconds == null) {
      return;
    }

    const timeout = setTimeout(() => {
      submit(null, { method: 'post', action: '/logout' });
    }, signOutAfterMilliseconds);

    return () => {
      clearTimeout(timeout);
    };
  }, [signOutAfterMilliseconds, submit]);

  useEffect(() => {
    if (pageSizeOverride != null) {
      dispatch(pageSizeChanged(pageSizeOverride));
    }
  }, [dispatch, pageSizeOverride]);

  return <>{children}</>;
};

export default TestEnvironment;
