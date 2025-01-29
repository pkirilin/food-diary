import { useRegisterSW } from 'virtual:pwa-register/react';
import { MSW_ENABLED } from '@/shared/config';

interface UseUpdateAppResult {
  updateAvailable: boolean;
  reload: () => Promise<void>;
  close: () => void;
}

const SHOULD_WAIT_FOR_MSW = import.meta.env.PROD && MSW_ENABLED;

export const useUpdateApp = (): UseUpdateAppResult => {
  const registerSW = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();

      if (SHOULD_WAIT_FOR_MSW) {
        const { initBrowserMockApi } = await import('@tests/mockApi');
        await initBrowserMockApi();
      }
    },
    onRegisterError: error => {
      // eslint-disable-next-line no-console
      console.error('Service worker registration error: ', error);
    },
  });

  const {
    needRefresh: [updateAvailable, setUpdateAvailable],
    updateServiceWorker,
  } = registerSW;

  return {
    updateAvailable,
    reload: () => updateServiceWorker(true),
    close: () => setUpdateAvailable(false),
  };
};
