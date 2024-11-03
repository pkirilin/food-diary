import { configureStore as configureStoreRtk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { noteModel } from '@/entities/note';
import { productModel } from '@/entities/product';
import { addNoteModel } from '@/features/addNote';
import { api } from '../shared/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureStore = () =>
  configureStoreRtk({
    reducer: {
      [api.reducerPath]: api.reducer,
      products: productModel.reducer,
      notes: noteModel.reducer,
      addNote: addNoteModel.reducer,
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  });

export const store: ReturnType<typeof configureStore> = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
