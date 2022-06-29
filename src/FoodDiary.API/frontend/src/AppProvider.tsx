import { CssBaseline, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import AuthProvider from './features/auth/AuthProvider';
import theme from './theme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type AppProviderProps = {
  store: Store;
  authToken?: string;
};

export default function AppProvider({
  children,
  store,
  authToken,
}: PropsWithChildren<AppProviderProps>) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Provider store={store}>
            <AuthProvider token={authToken}>
              <CssBaseline></CssBaseline>
              {children}
            </AuthProvider>
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
