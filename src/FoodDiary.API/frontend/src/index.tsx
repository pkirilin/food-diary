import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import * as serviceWorker from './serviceWorker';
import App from './App';
import store from './store';
import theme from './theme';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CssBaseline></CssBaseline>
        <App></App>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  </Provider>,
);

serviceWorker.unregister();
