const IGNORED_HOSTNAMES = ['apis.google.com', 'fonts.gstatic.com'];
const IGNORED_PATHNAMES = ['manifest.json', 'favicon.*', 'main.*.hot-update.js'];

export const initBrowserMockApi = async (): Promise<void> => {
  const { worker } = await import('./browser');
  const { initMockApiDb } = await import('./initMockApiDb');

  await initMockApiDb();

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
