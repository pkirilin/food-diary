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

  await worker.start({
    onUnhandledRequest: (request, print) => {
      if (IGNORED_URL_PATTERNS.some(regexp => regexp.test(request.url))) {
        return;
      }

      print.warning();
    },
  });
};
