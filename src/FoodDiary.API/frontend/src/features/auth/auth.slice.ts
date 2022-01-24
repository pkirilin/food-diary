import { createSlice } from '@reduxjs/toolkit';
import authApi from './auth.api';
import { getAccessToken } from './cookie.service';

export type AuthState = {
  isAuthenticated?: boolean;
};

const initialState: AuthState = {
  isAuthenticated: !!getAccessToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addMatcher(authApi.endpoints.signInWithGoogle.matchFulfilled, state => {
      state.isAuthenticated = true;
    }),
});

export default authSlice.reducer;
