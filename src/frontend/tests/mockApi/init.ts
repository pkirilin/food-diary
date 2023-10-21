import { drop } from '@mswjs/data';
import { fillCategories } from './categories';
import { db } from './db';
import { fillNotes } from './notes';
import { fillPages } from './pages';
import { fillProducts } from './products';

export const initMockApiDb = () => {
  drop(db);
  fillPages();
  fillNotes();
  fillProducts();
  fillCategories();
};

const IGNORED_HOSTNAMES = ['apis.google.com', 'fonts.gstatic.com'];
const IGNORED_PATHNAMES = ['manifest.json', 'favicon.*', 'main.*.hot-update.js'];

export const initBrowserMockApi = async () => {
  const { worker } = await import('./browser');

  initMockApiDb();

  await worker.start({
    onUnhandledRequest(request, print) {
      if (IGNORED_HOSTNAMES.some(hostname => request.url.hostname.match(hostname))) {
        return;
      }

      if (IGNORED_PATHNAMES.some(pathname => request.url.pathname.match(pathname))) {
        return;
      }

      print.warning();
    },
  });
};
