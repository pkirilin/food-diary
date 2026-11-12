import { useSyncExternalStore } from 'react';

const MULTI_ITEM_FOOD_LOGGING_KEY = 'devicePreferences.multiItemFoodLogging';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const readMultiItemFoodLoggingEnabled = (): boolean => {
  try {
    return localStorage.getItem(MULTI_ITEM_FOOD_LOGGING_KEY) === 'true';
  } catch {
    return false;
  }
};

const writeMultiItemFoodLoggingEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(MULTI_ITEM_FOOD_LOGGING_KEY, String(enabled));
  } catch {
    return;
  }

  listeners.forEach(listener => {
    listener();
  });
};

export const useMultiItemFoodLoggingPreference = (): [
  enabled: boolean,
  setEnabled: (enabled: boolean) => void,
] => [
  useSyncExternalStore(subscribe, readMultiItemFoodLoggingEnabled),
  writeMultiItemFoodLoggingEnabled,
];
