import { type AppStore, configureAppStore } from '../../../src/app/store';

export interface TestStoreBuilder {
  please: () => AppStore;
}

export const createTestStore = (): TestStoreBuilder => {
  const store = configureAppStore();

  const builder: TestStoreBuilder = {
    please: (): AppStore => {
      return store;
    },
  };

  return builder;
};
