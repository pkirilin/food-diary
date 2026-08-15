import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { MSW_ENABLED } from '@/shared/config';

declare let self: ServiceWorkerGlobalScope;

if (MSW_ENABLED) {
  importScripts(`./mockServiceWorker.js`);
}

const isSkipWaitingMessage = (data: unknown): boolean =>
  typeof data === 'object' && data !== null && 'type' in data && data.type === 'SKIP_WAITING';

self.addEventListener('message', event => {
  if (isSkipWaitingMessage(event.data)) {
    self.skipWaiting();
  }
});

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
