import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Root } from '@/app/Root';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
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
    <RootProvider store={configureStore()}>
      <Root>
        <TestEnvironment
          signOutAfterMilliseconds={signOutAfterMilliseconds}
          pageSizeOverride={pageSizeOverride}
        />
      </Root>
    </RootProvider>,
  );
};

export function render(
  ui: ReactElement,
  { signOutAfterMilliseconds, pageSizeOverride }: RenderOptions = {},
): RenderResult {
  const store = configureStore();

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
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );

  return result;
}
