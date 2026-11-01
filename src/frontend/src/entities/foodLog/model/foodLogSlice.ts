import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { type MealDraft, type MealType } from './types';

export interface FoodLogState {
  mealDraft: MealDraft | null;
}

const initialState: FoodLogState = {
  mealDraft: null,
};

interface MealDraftStartedPayload {
  date: string;
  mealType: MealType;
}

export const foodLogSlice = createSlice({
  name: 'foodLog',
  initialState,
  selectors: {
    mealDraft: state => state.mealDraft,
  },
  reducers: {
    mealDraftStarted: (state, { payload }: PayloadAction<MealDraftStartedPayload>) => {
      state.mealDraft = { date: payload.date, mealType: payload.mealType, foodLogs: [] };
    },
  },
});
