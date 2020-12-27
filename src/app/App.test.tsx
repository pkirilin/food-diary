import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  test('should render without errors', () => {
    render(<App></App>);
  });
});
