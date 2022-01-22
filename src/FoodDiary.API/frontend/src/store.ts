import { configureStore } from '@reduxjs/toolkit';
import pagesReducer from './features/pages/slice';
import categoriesReducer from './features/categories/slice';
import productsReducer from './features/products/slice';
import notesReducer from './features/notes/slice';
import authApi from './features/auth/auth.api';
import authReducer from './features/auth/auth.slice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,

    pages: pagesReducer,
    categories: categoriesReducer,
    products: productsReducer,
    notes: notesReducer,
  },

  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
