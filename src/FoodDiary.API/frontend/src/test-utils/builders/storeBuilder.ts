import { AppStore, configureAppStore } from '../../store';

export interface TestStoreBuilder {
  please: () => AppStore;
}

export const createTestStore = () => {
  const store = configureAppStore();

  const builder: TestStoreBuilder = {
    please: (): AppStore => {
      return store;
    },
  };

  return builder;
};
