import 'date-fns';
import { initBrowserMockApi } from 'tests/mockApi';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppProvider from './AppProvider';
import { MSW_ENABLED } from './config';
import store from './store';

(async () => {
  if (MSW_ENABLED) {
    await initBrowserMockApi();
  }

  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);

  root.render(
    <AppProvider store={store}>
      <App />
    </AppProvider>,
  );
})();
