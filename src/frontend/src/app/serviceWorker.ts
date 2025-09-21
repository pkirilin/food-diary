import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { DEMO_MODE_ENABLED, MSW_ENABLED } from '@/shared/config';

declare let self: ServiceWorkerGlobalScope;

if (import.meta.env.PROD && MSW_ENABLED) {
  const basePath = DEMO_MODE_ENABLED ? '/food-diary' : '';
  importScripts(`${basePath}/mockServiceWorker.js`);
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
