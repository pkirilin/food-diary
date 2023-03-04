import { configureStore } from '@reduxjs/toolkit';
import api from './api';
import { useAppSelector } from './features/__shared__/hooks';
import accountApi from './features/auth/api';
import categoriesApi from './features/categories/api';
import notesReducer from './features/notes/slice';
import pagesReducer from './features/pages/slice';
import productsApi from './features/products/api';
import productsReducer from './features/products/store';

export function configureAppStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [accountApi.reducerPath]: accountApi.reducer,
      [categoriesApi.reducerPath]: categoriesApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
      pages: pagesReducer,
      products: productsReducer,
      notes: notesReducer,
    },

    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(
        api.middleware,
        accountApi.middleware,
        categoriesApi.middleware,
        productsApi.middleware,
      ),
  });
}

const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof configureAppStore>;

export { useAppSelector };

export default store;
