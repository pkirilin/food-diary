import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { type AppStore } from '../store';
import { ErrorLayout, NotFoundPage } from '../ui';

interface RouterContext {
  store: AppStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  staticData: { appBar: null },
  component: RootLayout,
  notFoundComponent: RootNotFound,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

function RootNotFound() {
  return (
    <ErrorLayout>
      <NotFoundPage />
    </ErrorLayout>
  );
}
