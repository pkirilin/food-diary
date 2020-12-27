import React from 'react';
import App from './App';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from './store';

describe('App component', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <App></App>
      </Provider>,
    );
  });
});
