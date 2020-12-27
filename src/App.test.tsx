import React from 'react';
import App from './app';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { RootState } from './app/store';

const store = configureStore<RootState>()({
  counter: { value: 0 },
});

describe('App component', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <App></App>
      </Provider>,
    );
  });
});
