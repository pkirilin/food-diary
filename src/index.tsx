import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import App, { theme } from './app';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App></App>
  </ThemeProvider>,
  document.getElementById('root'),
);

serviceWorker.unregister();
