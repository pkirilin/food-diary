import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

type RenderOptions = {
  authToken?: string;
  removeTokenAfterMilliseconds?: number;
  pageSizeOverride?: number;
};

const defaultOptions: RenderOptions = {
  authToken: 'test_token',
};

export default function render(ui: React.ReactElement, options?: RenderOptions) {
  const { authToken, removeTokenAfterMilliseconds, pageSizeOverride } = {
    ...defaultOptions,
    ...options,
  };

  const store: ReturnType<typeof configureAppStore> = configureAppStore();

  const result = rtlRender(
    <TestEnvironment
      store={store}
      authToken={authToken}
      removeTokenAfterMilliseconds={removeTokenAfterMilliseconds}
      pageSizeOverride={pageSizeOverride}
    >
      {ui}
    </TestEnvironment>,
  );

  return result;
}
