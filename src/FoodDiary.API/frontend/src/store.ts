import { configureStore } from '@reduxjs/toolkit';

import api from './api';
import pagesReducer from './features/pages/slice';
import categoriesReducer from './features/categories/slice';
import productsReducer from './features/products/slice';
import notesReducer from './features/notes/slice';
import authReducer from './features/auth/auth.slice';

export function configureAppStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      pages: pagesReducer,
      categories: categoriesReducer,
      products: productsReducer,
      notes: notesReducer,
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  });
}

const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof configureAppStore>;

export default store;
