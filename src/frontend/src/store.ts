import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import { useAppDispatch, useAppSelector } from './features/__shared__/hooks';
import authReducer from './features/auth/store';
import pagesReducer from './features/pages/slice';
import productsReducer from './features/products/store';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureAppStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      pages: pagesReducer,
      products: productsReducer,
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  });

const store: ReturnType<typeof configureAppStore> = configureAppStore();

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof configureAppStore>;

export { useAppSelector, useAppDispatch };

export default store;
