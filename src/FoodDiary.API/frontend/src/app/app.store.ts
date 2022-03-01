import authReducer from '@features/auth/auth.slice';
import authApi from '@features/auth/auth.api';
import pagesReducer from '@features/pages/slice';
import categoriesReducer from '@features/categories/slice';
import productsReducer from '@features/products/slice';
import notesReducer from '@features/notes/slice';
import { ConfigureStoreOptions } from '@reduxjs/toolkit';

export const appReducer = {
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,

  pages: pagesReducer,
  categories: categoriesReducer,
  products: productsReducer,
  notes: notesReducer,
};

export const appMiddleware: ConfigureStoreOptions['middleware'] = getDefaultMiddleware =>
  getDefaultMiddleware().concat(authApi.middleware);
