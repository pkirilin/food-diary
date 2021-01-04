import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/slice';
import pagesReducer from './features/pages/slice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    pages: pagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
