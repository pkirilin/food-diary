import { appMiddleware, appReducer } from '@app/app.store';
import { configureStore, Store } from '@reduxjs/toolkit';

export interface StoreBuilder {
  withAuthenticatedUser: () => StoreBuilder;
  build: () => Store;
}

function createMockStore() {
  const store = configureStore({
    reducer: appReducer,
    middleware: appMiddleware,
  });

  return store;
}

export default function createStoreBuilder(): StoreBuilder {
  const store = createMockStore();

  const builder = {
    withAuthenticatedUser: () => {
      return builder;
    },

    build: () => store,
  };

  return builder;
}
