import { type RenderResult, render as rtlRender } from '@testing-library/react';
import { type ReactElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { RootProvider } from '@/app/RootProvider';
import { routes } from '@/app/routing';
import { configureStore, store as appStore } from '@/app/store';
import { api } from '@/shared/api';
import { usersService } from '../mockApi/user';
import TestEnvironment from './TestEnvironment';

interface RenderOptions {
  pageSizeOverride?: number;
}

export function render(ui: ReactElement, { pageSizeOverride }: RenderOptions = {}): RenderResult {
  const store = configureStore();

  const router = createMemoryRouter([
    {
      path: '/',
      element: <TestEnvironment pageSizeOverride={pageSizeOverride}>{ui}</TestEnvironment>,
    },
  ]);

  return rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );
}

const waitForFirstLoad = (router: ReturnType<typeof createMemoryRouter>): Promise<void> =>
  new Promise(resolve => {
    if (router.state.initialized) {
      resolve();
      return;
    }

    const unsubscribe = router.subscribe(state => {
      if (state.initialized) {
        unsubscribe();
        resolve();
      }
    });
  });

const resetRouteLoaderCache = (): void => {
  appStore.dispatch(api.util.resetApiState());
};

interface RenderAppOptions {
  signedIn?: boolean;
}

export const renderApp = async (
  url: string,
  { signedIn = false }: RenderAppOptions = {},
): Promise<void> => {
  if (signedIn) {
    usersService.signInById(1);
  }

  resetRouteLoaderCache();

  const store = configureStore();
  const router = createMemoryRouter(routes, { initialEntries: [url] });

  await waitForFirstLoad(router);

  rtlRender(
    <RootProvider store={store}>
      <RouterProvider router={router} />
    </RootProvider>,
  );
};
