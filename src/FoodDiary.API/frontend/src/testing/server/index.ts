import { SetupWorkerApi } from 'msw';
import { initializeDb } from './db';

const IGNORED_HOSTNAMES = ['apis.google.com', 'fonts.gstatic.com'];
const IGNORED_PATHNAMES = ['manifest.json', 'favicon.*', 'main.*.hot-update.js'];

type Browser = {
  worker: SetupWorkerApi;
};

export function initMocks() {
  if (process.env.REACT_APP_MSW_ENABLED === 'true') {
    initializeDb();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { worker } = require('./browser') as Browser;
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
