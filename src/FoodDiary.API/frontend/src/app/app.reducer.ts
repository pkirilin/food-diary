import authReducer from '@features/auth/auth.slice';
import authApi from '@features/auth/auth.api';
import pagesReducer from '@features/pages/slice';
import categoriesReducer from '@features/categories/slice';
import productsReducer from '@features/products/slice';
import notesReducer from '@features/notes/slice';

export default {
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,

  pages: pagesReducer,
  categories: categoriesReducer,
  products: productsReducer,
  notes: notesReducer,
};
