import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { productModel } from '@/entities/product';
import pagesReducer from '../features/pages/slice';
import { api } from '../shared/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureAppStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      pages: pagesReducer,
      products: productModel.reducer,
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  });

export const store: ReturnType<typeof configureAppStore> = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof configureAppStore>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
