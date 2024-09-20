import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { RootProvider } from '@/app/RootProvider';
import { createRouter } from '@/app/routing';
import { configureStore } from '@/app/store';
import { AppLoader } from '@/shared/ui';
import TestEnvironment from './TestEnvironment';

interface RenderOptions {
  signOutAfterMilliseconds?: number;
  pageSizeOverride?: number;
}

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

export const renderWithRouter = (): void => {
  const store = configureStore();
  const router = createRouter();

  rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} fallbackElement={<AppLoader />} />
    </RootProvider>,
  );
};
