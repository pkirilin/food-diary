import { createHashHistory, createRouter, type RouterHistory } from '@tanstack/react-router';
import { type AppBarConfig } from '@/widgets/Navigation';
import { routeTree } from './routeTree.gen';
import { type AppStore } from './store';
import { ErrorScreen } from './ui';

interface AppRouterOptions {
  history?: RouterHistory;
  defaultPendingMinMs?: number;
}

export const createAppRouter = (
  store: AppStore,
  { history = createHashHistory(), ...overrides }: AppRouterOptions = {},
) =>
  createRouter({
    routeTree,
    history,
    context: { store },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorScreen,
    // createRouter spreads its options over its own defaults, so a key passed as undefined erases
    // the default: pass only the keys the caller set
    ...overrides,
  });

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }

  interface StaticDataRouteOption {
    appBar: AppBarConfig | null;
  }
}
