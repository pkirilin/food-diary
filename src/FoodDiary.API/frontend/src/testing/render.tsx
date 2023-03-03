import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

type RenderOptions = {
  withAuthentication?: boolean;
  removeTokenAfterMilliseconds?: number;
  pageSizeOverride?: number;
};

const defaultOptions: RenderOptions = {
  withAuthentication: true,
};

export default function render(ui: React.ReactElement, options?: RenderOptions) {
  const { withAuthentication, removeTokenAfterMilliseconds, pageSizeOverride } = {
    ...defaultOptions,
    ...options,
  };

  const store: ReturnType<typeof configureAppStore> = configureAppStore();

  const result = rtlRender(
    <TestEnvironment
      store={store}
      withAuthentication={withAuthentication}
      removeTokenAfterMilliseconds={removeTokenAfterMilliseconds}
      pageSizeOverride={pageSizeOverride}
    >
      {ui}
    </TestEnvironment>,
  );

  return result;
}
