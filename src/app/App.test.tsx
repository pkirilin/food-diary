import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import App from './App';
import theme from './theme';
import store from './store';

describe('App component', () => {
  test('should render without errors', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App></App>
        </ThemeProvider>
      </Provider>,
    );
  });
});
