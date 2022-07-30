import 'date-fns';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppProvider from './AppProvider';
import { getToken } from './features/auth/utils';
import store from './store';
import { initMocks } from './testing/server';

initMocks();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <AppProvider store={store} authToken={getToken()}>
    <App />
  </AppProvider>,
);
