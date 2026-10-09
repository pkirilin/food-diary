import { type PropsWithChildren, type FC, useEffect } from 'react';
import { useAppDispatch } from '@/app/store';
import { productModel } from '@/entities/product';

interface TestEnvironmentProps {
  pageSizeOverride?: number;
}

const TestEnvironment: FC<PropsWithChildren<TestEnvironmentProps>> = ({
  children,
  pageSizeOverride,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (pageSizeOverride != null) {
      dispatch(productModel.actions.pageSizeChanged(pageSizeOverride));
    }
  }, [dispatch, pageSizeOverride]);

  return children;
};

export default TestEnvironment;
