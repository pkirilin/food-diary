import 'date-fns';
import { initBrowserMockApi } from 'tests/mockApi';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppProvider from './AppProvider';
import { GOOGLE_ANALYTICS_ENABLED, MSW_ENABLED } from './config';
import { initGoogleAnalytics } from './googleAnalytics';
import store from './store';

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
    <AppProvider store={store}>
      <App />
    </AppProvider>,
  );
})();
