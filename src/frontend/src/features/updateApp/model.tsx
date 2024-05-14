import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { RootLoader } from '@/app/Root/RootLoader';
import { MSW_ENABLED } from '@/shared/config';

export interface State {
  updateAvailable: boolean;
  reload: () => Promise<void>;
  close: () => void;
}

export const Context = createContext<State>({
  updateAvailable: false,
  reload: () => Promise.resolve(),
  close: () => {},
});

export const useUpdateApp = (): State => useContext(Context);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD && MSW_ENABLED) {
      setRegistered(true);
    }
  }, []);

  const registerSW = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();

      if (import.meta.env.PROD && MSW_ENABLED) {
        const { initBrowserMockApi } = await import('@tests/mockApi');
        await initBrowserMockApi();
      }

      setRegistered(true);
    },
    onRegisterError: error => {
      // eslint-disable-next-line no-console
      console.error('Service worker registration error: ', error);
      setRegistered(false);
    },
  });

  const {
    needRefresh: [updateAvailable, setUpdateAvailable],
    updateServiceWorker,
  } = registerSW;

  const reload = useCallback((): Promise<void> => updateServiceWorker(true), [updateServiceWorker]);

  const close = useCallback((): void => {
    setUpdateAvailable(false);
  }, [setUpdateAvailable]);

  const state = useMemo<State>(
    () => ({
      updateAvailable,
      reload,
      close,
    }),
    [close, updateAvailable, reload],
  );

  if (!registered) {
    return <RootLoader />;
  }

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
