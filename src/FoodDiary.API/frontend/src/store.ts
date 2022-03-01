import { appMiddleware, appReducer } from '@app/app.store';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: appReducer,
  middleware: appMiddleware,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
