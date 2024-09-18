import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { type RouteObject, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
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

export const renderRoute = (
  route: RouteObject,
  { signOutAfterMilliseconds, pageSizeOverride }: RenderOptions = {},
): RenderResult => {
  const store = configureStore();

  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <TestEnvironment
          signOutAfterMilliseconds={signOutAfterMilliseconds}
          pageSizeOverride={pageSizeOverride}
        >
          {route.Component && <route.Component></route.Component>}
        </TestEnvironment>
      ),
      loader: route.loader,
      action: route.action,
    },
    {
      path: '/login',
      lazy: () => import('@/pages/ui/LoginPage'),
    },
    {
      path: '/logout',
      lazy: () => import('@/pages/ui/LogoutPage'),
    },
  ]);

  return rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );
};
