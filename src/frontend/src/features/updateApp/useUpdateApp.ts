import { useRegisterSW } from 'virtual:pwa-register/react';

interface UseUpdateAppResult {
  updateAvailable: boolean;
  reload: () => Promise<void>;
  close: () => void;
}

export const useUpdateApp = (): UseUpdateAppResult => {
  const registerSW = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();
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
