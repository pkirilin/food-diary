import 'date-fns';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { GOOGLE_ANALYTICS_ENABLED } from '@/shared/config';
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
  const router = createRouter();

  root.render(
    <RootProvider store={store}>
      <WithMockApi>
        <RouterProvider router={router} />
      </WithMockApi>
    </RootProvider>,
  );
})();
