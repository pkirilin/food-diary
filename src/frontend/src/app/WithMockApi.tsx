import { type FC, type PropsWithChildren, useState, useEffect } from 'react';
import { MSW_ENABLED } from '@/shared/config';
import { AppLoader } from '@/shared/ui';

export const WithMockApi: FC<PropsWithChildren> = ({ children }) => {
  const [mockApiInitialized, setMockApiInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      if (MSW_ENABLED) {
        const { initBrowserMockApi } = await import('@tests/mockApi');
        await initBrowserMockApi();
      }

      setMockApiInitialized(true);
    })();
  }, []);

  if (!mockApiInitialized) {
    return <AppLoader />;
  }

  return children;
};
