import { initializeDb } from './db';

const IGNORED_HOSTNAMES = ['apis.google.com', 'fonts.gstatic.com'];
const IGNORED_PATHNAMES = ['manifest.json', 'favicon.*', 'main.*.hot-update.js'];

export async function initMocks() {
  if (import.meta.env.VITE_APP_MSW_ENABLED === 'true') {
    initializeDb();
    const { worker } = await import('./browser');
    worker.start({
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
  }
}
