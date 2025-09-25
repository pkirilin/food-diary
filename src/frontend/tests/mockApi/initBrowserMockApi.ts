import { DEMO_MODE_ENABLED } from '@/shared/config';

const IGNORED_URL_PATTERNS: RegExp[] = [
  /fonts.gstatic.com/,
  /fonts.googleapis.com/,
  /\/site.webmanifest/,
  /^\/src/,
  /localhost:5173/,
  /chrome-extension:\/\//,
];

export const initBrowserMockApi = async (): Promise<void> => {
  const { worker } = await import('./browser');
  const { initMockApiDb } = await import('./initMockApiDb');

  await initMockApiDb();

  const basePath = import.meta.env.PROD && DEMO_MODE_ENABLED ? './' : '';

  await worker.start({
    serviceWorker: {
      url: import.meta.env.PROD ? 'serviceWorker.js' : 'mockServiceWorker.js',
      options: {
        scope: basePath,
      },
    },

    onUnhandledRequest: (request, print) => {
      if (IGNORED_URL_PATTERNS.some(regexp => regexp.test(request.url))) {
        return;
      }

      print.warning();
    },
  });
};
