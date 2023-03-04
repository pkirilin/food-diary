import 'date-fns';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppProvider from './AppProvider';
import store from './store';
import { initMocks } from './testing/server';

initMocks();

const useFakeAuth =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_MSW_ENABLED === 'true';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <AppProvider store={store} useFakeAuth={useFakeAuth}>
    <App />
  </AppProvider>,
);
