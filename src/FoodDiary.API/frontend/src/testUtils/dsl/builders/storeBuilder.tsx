import { AppStore, configureAppStore } from '../../../store';

export interface TestStoreBuilder {
  withAuthenticatedUser: () => TestStoreBuilder;
  please: () => AppStore;
}

export const createTestStore = (): TestStoreBuilder => {
  const store = configureAppStore();

  const builder: TestStoreBuilder = {
    withAuthenticatedUser: () => {
      return builder;
    },

    please: (): AppStore => {
      return store;
    },
  };

  return builder;
};
