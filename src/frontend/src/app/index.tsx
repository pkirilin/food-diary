import 'date-fns';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { GOOGLE_ANALYTICS_ENABLED } from '@/shared/config';
import { initGoogleAnalytics } from './googleAnalytics';
import { RootProvider } from './RootProvider';
import { createAppRouter } from './router';
import { store } from './store';
import { WithMockApi } from './WithMockApi';

if (GOOGLE_ANALYTICS_ENABLED) {
  initGoogleAnalytics();
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
const router = createAppRouter(store);

root.render(
  <RootProvider store={store}>
    <WithMockApi>
      <RouterProvider router={router} />
    </WithMockApi>
  </RootProvider>,
);
