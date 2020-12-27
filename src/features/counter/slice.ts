import { createSlice } from '@reduxjs/toolkit';

export type CounterState = {
  value: number;
};

const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state): void => {
      state.value += 1;
    },
  },
});

const { increment } = counterSlice.actions;

export { increment };

export default counterSlice.reducer;
