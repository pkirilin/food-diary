import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import AppProvider from 'src/AppProvider';
import { actions as authActions } from 'src/features/auth/store';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

interface RenderOptions {
  withAuthentication?: boolean;
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
}

const defaultOptions: RenderOptions = {
  withAuthentication: true,
};

function prepareStore(
  store: ReturnType<typeof configureAppStore>,
  { withAuthentication }: RenderOptions,
): void {
  if (withAuthentication) {
    store.dispatch(authActions.signIn());
  } else if (withAuthentication === false) {
    store.dispatch(authActions.signOut());
  }
}

export default function render(ui: ReactElement, options?: RenderOptions): RenderResult {
  const optionsToApply = {
    ...defaultOptions,
    ...options,
  };

  const store: ReturnType<typeof configureAppStore> = configureAppStore();
  prepareStore(store, optionsToApply);

  const { signOutAfterMilliseconds, pageSizeOverride } = optionsToApply;

  const result = rtlRender(
    <AppProvider store={store}>
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
