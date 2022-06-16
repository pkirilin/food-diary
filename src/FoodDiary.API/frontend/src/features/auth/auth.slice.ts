import { createSlice } from '@reduxjs/toolkit';
import { getAccessToken } from './cookie.service';
import api from 'src/api';

export type AuthState = {
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  isAuthenticated: !!getAccessToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addMatcher(api.endpoints.signInWithGoogle.matchFulfilled, state => {
      state.isAuthenticated = true;
    }),
});

export default authSlice.reducer;
