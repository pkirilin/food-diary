import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

type RenderOptions = {
  authToken?: string;
  removeTokenAfterMilliseconds?: number;
};

const defaultOptions: RenderOptions = {
  authToken: 'test_token',
};

export default function render(ui: React.ReactElement, options?: RenderOptions) {
  const { authToken, removeTokenAfterMilliseconds } = {
    ...defaultOptions,
    ...options,
  };

  const store = configureAppStore();

  const result = rtlRender(
    <TestEnvironment
      store={store}
      authToken={authToken}
      removeTokenAfterMilliseconds={removeTokenAfterMilliseconds}
    >
      {ui}
    </TestEnvironment>,
  );

  return result;
}
