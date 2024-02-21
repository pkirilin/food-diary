import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from '@/App';
import AppProvider from 'src/AppProvider';
import { configureAppStore } from 'src/store';
import TestEnvironment from './TestEnvironment';

interface RenderOptions {
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
}

export const renderApp = ({
  signOutAfterMilliseconds,
  pageSizeOverride,
}: RenderOptions = {}): void => {
  rtlRender(
    <AppProvider store={configureAppStore()}>
      <App>
        <TestEnvironment
          signOutAfterMilliseconds={signOutAfterMilliseconds}
          pageSizeOverride={pageSizeOverride}
        />
      </App>
    </AppProvider>,
  );
};

export default function render(
  ui: ReactElement,
  { signOutAfterMilliseconds, pageSizeOverride }: RenderOptions = {},
): RenderResult {
  const store = configureAppStore();

  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <TestEnvironment
          signOutAfterMilliseconds={signOutAfterMilliseconds}
          pageSizeOverride={pageSizeOverride}
        >
          {ui}
        </TestEnvironment>
      ),
    },
  ]);

  const result = rtlRender(
    <AppProvider store={store}>
      <RouterProvider router={router} />
    </AppProvider>,
  );

  return result;
}
