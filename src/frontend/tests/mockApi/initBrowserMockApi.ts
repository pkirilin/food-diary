const IGNORED_URL_PATTERNS: RegExp[] = [
  /fonts.gstatic.com/,
  /fonts.googleapis.com/,
  /\/site.webmanifest/,
  /^\/src/,
  /localhost:5173/,
  /chrome-extension:\/\//,
  /assets/,
  /google-analytics/,
];

export const initBrowserMockApi = async (): Promise<void> => {
  const { worker } = await import('./browser');
  const { initMockApiDb } = await import('./initMockApiDb');

  await initMockApiDb();

  await worker.start({
    serviceWorker: {
      url: import.meta.env.PROD ? 'serviceWorker.js' : 'mockServiceWorker.js',
      options: {
        scope: './',
      },
    },

    onUnhandledRequest: (request, print) => {
      const url = new URL(request.url);
      const target = `${url.host}${url.pathname}`;

      if (IGNORED_URL_PATTERNS.some(regexp => regexp.test(target))) {
        return;
      }

      print.warning();
    },
  });
};
