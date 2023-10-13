import { createSlice } from '@reduxjs/toolkit';
import { AuthUserState } from './types';

export type AuthState = {
  user?: AuthUserState;
};

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
});

export default authSlice;
