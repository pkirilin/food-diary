import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api';
import { type AuthUserState } from './types';

export interface AuthState {
  user?: AuthUserState;
}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: state => {
      state.user = {
        isAuthenticated: true,
      };
    },

    signOut: state => {
      state.user = {
        isAuthenticated: false,
      };
    },
  },
  extraReducers: builder =>
    builder.addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
      state.user = {
        isAuthenticated: payload.isAuthenticated,
      };
    }),
});

export default authSlice;
