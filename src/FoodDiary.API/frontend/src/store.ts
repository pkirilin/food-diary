import { configureStore } from '@reduxjs/toolkit';

import pagesReducer from './features/pages/slice';
import categoriesReducer from './features/categories/slice';
import productsReducer from './features/products/slice';
import notesReducer from './features/notes/slice';
import authReducer from './features/auth/auth.slice';

import authApi from './features/auth/auth.api';
import categoriesApi from './features/categories/categoriesApi';
import productsApi from './features/products/productsApi';

export function configureAppStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      pages: pagesReducer,
      categories: categoriesReducer,
      products: productsReducer,
      notes: notesReducer,

      [authApi.reducerPath]: authApi.reducer,
      [categoriesApi.reducerPath]: categoriesApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
    },

    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        categoriesApi.middleware,
        productsApi.middleware,
      ),
  });
}

const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof configureAppStore>;

export default store;
