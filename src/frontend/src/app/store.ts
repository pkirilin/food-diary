import { configureStore as configureStoreRtk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { productModel } from '@/entities/product';
import { manageNoteModel } from '@/features/manageNote';
import { api } from '../shared/api';

export const configureStore = () =>
  configureStoreRtk({
    reducer: {
      [api.reducerPath]: api.reducer,
      products: productModel.reducer,
      manageNote: manageNoteModel.reducer,
    },

    middleware: getDefaultMiddleware =>
      getDefaultMiddleware()
        .prepend(manageNoteModel.imageUrlsListener.middleware)
        .concat(api.middleware),
  });

export type AppStore = ReturnType<typeof configureStore>;

export const store: AppStore = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
