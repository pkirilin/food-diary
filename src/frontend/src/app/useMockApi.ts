import { useState, useEffect } from 'react';
import { MSW_ENABLED } from '@/shared/config';

export const useMockApi = (): boolean => {
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

  return mockApiInitialized;
};
