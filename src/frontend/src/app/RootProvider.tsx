import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { type Store } from '@reduxjs/toolkit';
import { type PropsWithChildren, type FC, useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { MSW_ENABLED } from '@/shared/config';
import { theme } from './theme';

interface Props {
  store: Store;
}

export const RootProvider: FC<PropsWithChildren<Props>> = ({ children, store }) => {
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

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Provider store={store}>
            <CssBaseline />
            {!mockApiInitialized ? <div>Initializing mock api...</div> : children}
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
