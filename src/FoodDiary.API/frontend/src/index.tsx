import 'date-fns';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import * as serviceWorker from './serviceWorker';
import App from './App';
import store from './store';
import theme from './theme';
import AuthProvider from './features/auth/AuthProvider';
import { getToken } from './features/auth/utils';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <AuthProvider token={getToken()}>
          <CssBaseline></CssBaseline>
          <App></App>
        </AuthProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  </Provider>,
);

serviceWorker.unregister();
