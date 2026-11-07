import {
  createHashHistory,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { RootProvider } from '@/app/RootProvider';
import { createAppRouter } from '@/app/router';
import { configureStore } from '@/app/store';
import { usersService } from '../mockApi/user';
import TestEnvironment from './TestEnvironment';

interface RenderOptions {
  pageSizeOverride?: number;
}

export const render = async (
  ui: ReactElement,
  { pageSizeOverride }: RenderOptions = {},
): Promise<RenderResult> => {
  const store = configureStore();

  const rootRoute = createRootRoute({
    staticData: { appBar: null },
    component: () => <TestEnvironment pageSizeOverride={pageSizeOverride}>{ui}</TestEnvironment>,
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  await router.load();

  return rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );
};

interface RenderAppOptions {
  signedIn?: boolean;
}

export const renderApp = async (
  url: string,
  { signedIn = false }: RenderAppOptions = {},
): Promise<RenderResult> => {
  if (signedIn) {
    usersService.signInById(1);
  }

  // The app's own hash history, because a memory history never runs navigation blockers on back
  window.history.replaceState(null, '', `/#${url}`);
  const history = createHashHistory();
  onTestFinished(() => {
    history.destroy();
  });

  const store = configureStore();
  const router = createAppRouter(store, history);

  const view = rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );

  await act(() => router.load());

  return view;
};
