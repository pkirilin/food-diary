import { createHashHistory, createRouter, type RouterHistory } from '@tanstack/react-router';
import { type AppBarConfig } from '@/widgets/Navigation';
import { routeTree } from './routeTree.gen';
import { type AppStore } from './store';
import { ErrorScreen } from './ui';

export const createAppRouter = (store: AppStore, history: RouterHistory = createHashHistory()) =>
  createRouter({
    routeTree,
    history,
    context: { store },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorScreen,
  });

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }

  interface StaticDataRouteOption {
    appBar: AppBarConfig | null;
  }
}
