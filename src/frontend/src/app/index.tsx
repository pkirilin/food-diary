import 'date-fns';
import { initBrowserMockApi } from 'tests/mockApi';
import { createRoot } from 'react-dom/client';
import { GOOGLE_ANALYTICS_ENABLED, MSW_ENABLED } from '@/shared/config';
import { initGoogleAnalytics } from './googleAnalytics';
import { Root } from './Root';
import { RootProvider } from './RootProvider';
import { store } from './store';

void (async () => {
  if (MSW_ENABLED) {
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

  root.render(
    <RootProvider store={store}>
      <Root />
    </RootProvider>,
  );
})();
