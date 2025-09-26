import 'date-fns';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GOOGLE_ANALYTICS_ENABLED } from '@/shared/config';
import { AppLoader } from '@/shared/ui';
import { initGoogleAnalytics } from './googleAnalytics';
import { RootProvider } from './RootProvider';
import { createRouter } from './routing';
import { store } from './store';
import { WithMockApi } from './WithMockApi';

(async () => {
  if (GOOGLE_ANALYTICS_ENABLED) {
    initGoogleAnalytics();
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Failed to find the root element');
  }

  const root = createRoot(container);

  // IMPORTANT: router should be created after msw started
  // Otherwise, loaders will activate and start fetching data before msw started
  const router = createRouter();

  root.render(
    <RootProvider store={store}>
      <WithMockApi>
        <RouterProvider router={router} fallbackElement={<AppLoader />} />
      </WithMockApi>
    </RootProvider>,
  );
})();
