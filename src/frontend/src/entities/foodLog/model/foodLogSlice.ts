import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { calculateNutritionValues } from './foodLog';
import { type MealDraft, type MealDraftFoodLog, type MealType } from './types';

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

const EMPTY_FOOD_LOGS: MealDraftFoodLog[] = [];

export const foodLogSlice = createSlice({
  name: 'foodLog',
  initialState,
  selectors: {
    mealDraft: state => state.mealDraft,
    isInMealDraft: (state, productId: number) =>
      state.mealDraft?.foodLogs.some(({ product }) => product.id === productId) ?? false,
    foodLogsCount: state => state.mealDraft?.foodLogs.length ?? 0,
    totalCalories: state =>
      calculateNutritionValues(state.mealDraft?.foodLogs ?? EMPTY_FOOD_LOGS).calories,
  },
  reducers: {
    mealDraftStarted: (state, { payload }: PayloadAction<MealDraftStartedPayload>) => {
      state.mealDraft = { date: payload.date, mealType: payload.mealType, foodLogs: [] };
    },
    foodLogAdded: (state, { payload }: PayloadAction<MealDraftFoodLog>) => {
      const foodLogs = state.mealDraft?.foodLogs;

      if (foodLogs?.some(({ product }) => product.id === payload.product.id) === false) {
        foodLogs.push(payload);
      }
    },
    foodLogRemoved: (state, { payload: productId }: PayloadAction<number>) => {
      if (state.mealDraft !== null) {
        state.mealDraft.foodLogs = state.mealDraft.foodLogs.filter(
          ({ product }) => product.id !== productId,
        );
      }
    },
    mealDraftDiscarded: state => {
      state.mealDraft = null;
    },
    mealDraftLogged: state => {
      state.mealDraft = null;
    },
  },
});
