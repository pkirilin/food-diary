import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import AppProvider from 'src/AppProvider';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

type RenderOptions = {
  withAuthentication?: boolean;
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
};

const defaultOptions: RenderOptions = {
  withAuthentication: true,
};

export default function render(ui: React.ReactElement, options?: RenderOptions) {
  const { withAuthentication, signOutAfterMilliseconds, pageSizeOverride } = {
    ...defaultOptions,
    ...options,
  };

  const store: ReturnType<typeof configureAppStore> = configureAppStore();

  const result = rtlRender(
    <AppProvider store={store} withAuthentication={withAuthentication} useFakeAuth>
      <TestEnvironment
        store={store}
        signOutAfterMilliseconds={signOutAfterMilliseconds}
        pageSizeOverride={pageSizeOverride}
      >
        {ui}
      </TestEnvironment>
    </AppProvider>,
  );

  return result;
}
