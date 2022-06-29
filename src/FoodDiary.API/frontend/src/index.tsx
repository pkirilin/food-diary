import 'date-fns';
import { createRoot } from 'react-dom/client';
import * as serviceWorker from './serviceWorker';
import App from './App';
import AppProvider from './AppProvider';
import store from './store';
import { getToken } from './features/auth/utils';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <AppProvider store={store} authToken={getToken()}>
    <App></App>
  </AppProvider>,
);

serviceWorker.unregister();
