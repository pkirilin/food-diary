import { createSlice } from '@reduxjs/toolkit';
import authApi from './auth.api';

export type AuthState = {
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: state => {
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder =>
    builder.addMatcher(authApi.endpoints.signInWithGoogle.matchFulfilled, state => {
      state.isAuthenticated = true;
    }),
});

export const { userLoggedIn } = authSlice.actions;

export default authSlice.reducer;
