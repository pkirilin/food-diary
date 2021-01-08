import { configureStore } from '@reduxjs/toolkit';
import pagesReducer from './features/pages/slice';

const store = configureStore({
  reducer: {
    pages: pagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
