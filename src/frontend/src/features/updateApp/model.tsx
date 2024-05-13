import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react';
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
  const registerSW = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();

      if (MSW_ENABLED) {
        const { initBrowserMockApi } = await import('@tests/mockApi');
        await initBrowserMockApi();
      }
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

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
