import 'date-fns';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as serviceWorker from './serviceWorker';
import App from './App';
import store from './store';
import theme from './theme';
import AuthProvider from './features/auth/AuthProvider';
import { getToken } from './features/auth/utils';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider token={getToken()}>
            <CssBaseline></CssBaseline>
            <App></App>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>,
);

serviceWorker.unregister();
