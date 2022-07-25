import { configureStore } from '@reduxjs/toolkit';
import { categoriesApi } from 'src/features/categories';
import api from './api';
import notesReducer from './features/notes/slice';
import pagesReducer from './features/pages/slice';
import productsReducer from './features/products/slice';

export function configureAppStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [categoriesApi.reducerPath]: categoriesApi.reducer,
      pages: pagesReducer,
      products: productsReducer,
      notes: notesReducer,
    },

    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(api.middleware, categoriesApi.middleware),
  });
}

const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof configureAppStore>;

export default store;
