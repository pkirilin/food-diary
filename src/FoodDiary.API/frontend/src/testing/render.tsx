import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import AppProvider from 'src/AppProvider';
import { configureAppStore } from 'src/store';

type RenderOptions = {
  authToken?: string;
};

const defaultOptions: RenderOptions = {
  authToken: 'test_token',
};

export default function render(ui: ReactElement, options: RenderOptions = defaultOptions) {
  const { authToken } = options;
  const store = configureAppStore();

  const result = rtlRender(
    <AppProvider store={store} authToken={authToken}>
      {ui}
    </AppProvider>,
  );

  return result;
}
