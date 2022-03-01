import { configureStore } from '@reduxjs/toolkit';
import authApi from './features/auth/auth.api';
import appReducer from '@app/app.reducer';

const store = configureStore({
  reducer: appReducer,

  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
