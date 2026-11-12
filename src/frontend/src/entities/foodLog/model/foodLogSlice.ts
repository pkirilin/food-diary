import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { calculateNutritionValues } from './foodLog';
import {
  type MealDraft,
  type MealDraftFoodLog,
  type MealDraftProduct,
  type MealType,
} from './types';

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

interface FoodLogQuantityChangedPayload {
  productId: number;
  quantity: number;
}

const EMPTY_FOOD_LOGS: MealDraftFoodLog[] = [];

const findFoodLog = (
  mealDraft: MealDraft | null,
  productId: number,
): MealDraftFoodLog | undefined =>
  mealDraft?.foodLogs.find(({ product }) => product.id === productId);

export const foodLogSlice = createSlice({
  name: 'foodLog',
  initialState,
  selectors: {
    mealDraft: state => state.mealDraft,
    isInMealDraft: (state, productId: number) =>
      findFoodLog(state.mealDraft, productId) !== undefined,
    foodLogOfProduct: (state, productId: number) => findFoodLog(state.mealDraft, productId) ?? null,
    foodLogsCount: state => state.mealDraft?.foodLogs.length ?? 0,
    totalCalories: state =>
      calculateNutritionValues(state.mealDraft?.foodLogs ?? EMPTY_FOOD_LOGS).calories,
  },
  reducers: {
    mealDraftStarted: (state, { payload }: PayloadAction<MealDraftStartedPayload>) => {
      state.mealDraft = { date: payload.date, mealType: payload.mealType, foodLogs: [] };
    },
    foodLogAdded: (state, { payload }: PayloadAction<MealDraftFoodLog>) => {
      if (
        state.mealDraft !== null &&
        findFoodLog(state.mealDraft, payload.product.id) === undefined
      ) {
        state.mealDraft.foodLogs.push(payload);
      }
    },
    foodLogQuantityChanged: (state, { payload }: PayloadAction<FoodLogQuantityChangedPayload>) => {
      const foodLog = findFoodLog(state.mealDraft, payload.productId);

      if (foodLog !== undefined) {
        foodLog.quantity = payload.quantity;
      }
    },
    productUpdated: (state, { payload: product }: PayloadAction<MealDraftProduct>) => {
      const foodLog = findFoodLog(state.mealDraft, product.id);

      if (foodLog !== undefined) {
        foodLog.product = product;
        foodLog.quantity = product.defaultQuantity;
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
