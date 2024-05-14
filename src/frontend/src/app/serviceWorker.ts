import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { MSW_ENABLED } from '@/shared/config';

declare let self: ServiceWorkerGlobalScope;

if (import.meta.env.PROD && MSW_ENABLED) {
  importScripts('/mockServiceWorker.js');
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
