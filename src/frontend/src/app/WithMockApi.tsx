import { Box, Typography } from '@mui/material';
import { type FC, type PropsWithChildren, useState, useEffect } from 'react';
import { MSW_ENABLED } from '@/shared/config';
import { AppLoader } from '@/shared/ui';

export const WithMockApi: FC<PropsWithChildren> = ({ children }) => {
  const [mockApiInitialized, setMockApiInitialized] = useState(false);
  const [error, setError] = useState(false);

  const init = async (): Promise<void> => {
    try {
      if (MSW_ENABLED) {
        const { initBrowserMockApi } = await import('@tests/mockApi');
        await initBrowserMockApi();
      }

      setMockApiInitialized(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize MSW', error);
      setError(true);
    }
  };

  useEffect(() => {
    void init();
  }, []);

  if (error) {
    return (
      <Box p={2}>
        <Typography>Failed to initialize Mock API</Typography>
      </Box>
    );
  }

  if (!mockApiInitialized) {
    return <AppLoader />;
  }

  return children;
};
