import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import App, { store, theme } from './app';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App></App>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
);

serviceWorker.unregister();
