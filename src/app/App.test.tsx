import React from 'react';
import App from './App';
import { renderExtended } from '../features/__shared__/utils';

describe('App component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render without errors', () => {
    renderExtended(<App></App>, jest.fn());
  });
});
