import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core/styles';
import App from './App';
import theme from './theme';

describe('App component', () => {
  test('should render without errors', () => {
    render(
      <ThemeProvider theme={theme}>
        <App></App>
      </ThemeProvider>,
    );
  });
});
