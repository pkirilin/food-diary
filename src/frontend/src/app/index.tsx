import 'date-fns';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GOOGLE_ANALYTICS_ENABLED, MSW_ENABLED } from '@/shared/config';
import { AppLoader } from '@/shared/ui';
import { initGoogleAnalytics } from './googleAnalytics';
import { RootProvider } from './RootProvider';
import { createRouter } from './routing';
import { store } from './store';

(async () => {
  if (!import.meta.env.PROD && MSW_ENABLED) {
    const { initBrowserMockApi } = await import('@tests/mockApi');
    await initBrowserMockApi();
  }

  if (GOOGLE_ANALYTICS_ENABLED) {
    initGoogleAnalytics();
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Failed to find the root element');
  }

  const root = createRoot(container);

  // IMPORTANT: router should be created before msw started
  // Otherwise, loaders will activate and start fetching data before msw started
  const router = createRouter();

  root.render(
    <RootProvider store={store}>
      <RouterProvider router={router} fallbackElement={<AppLoader />} />
    </RootProvider>,
  );
})();
