import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { type PropsWithChildren, type FC } from 'react';
import { Provider } from 'react-redux';
import { type Store } from 'redux';
import theme from './theme';

interface AppProviderProps {
  store: Store;
}

const AppProvider: FC<PropsWithChildren<AppProviderProps>> = ({ children, store }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Provider store={store}>
            <CssBaseline />
            {children}
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default AppProvider;
