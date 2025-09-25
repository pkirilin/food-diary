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

  const basePath = DEMO_MODE_ENABLED ? '/food-diary' : '';

  // eslint-disable-next-line no-console
  console.info('Starting MSW...');

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
