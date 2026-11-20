import { type AppStore, configureStore } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';

export const MEAL_DRAFT_DATE = '2023-10-19';

// These match the mock API's seeded products, so requests made for them succeed
export const OATS: foodLogModel.MealDraftProduct = {
  id: 6,
  name: 'Oats',
  defaultQuantity: 100,
  calories: 379,
  protein: 16.9,
  fats: 6.9,
  carbs: 66.3,
  sugar: 0.8,
  salt: 0,
};

export const CHICKEN: foodLogModel.MealDraftProduct = {
  id: 7,
  name: 'Chicken',
  defaultQuantity: 150,
  calories: 239,
  protein: 27,
  fats: 14,
  carbs: 0,
  sugar: 0,
  salt: 0.3,
};

export const MILK: foodLogModel.MealDraftProduct = {
  id: 4,
  name: 'Milk',
  defaultQuantity: 100,
  calories: 60,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

export const configureStoreWithMealDraft = (
  pickedProducts: foodLogModel.MealDraftProduct[] = [],
  mealType = foodLogModel.MealType.Breakfast,
): AppStore => {
  const store = configureStore();
  store.dispatch(foodLogModel.actions.mealDraftStarted({ date: MEAL_DRAFT_DATE, mealType }));
  pickedProducts.forEach(product => {
    store.dispatch(
      foodLogModel.actions.foodLogAdded({ product, quantity: product.defaultQuantity }),
    );
  });
  return store;
};

export const getMealDraftFoodLogs = (store: AppStore): foodLogModel.MealDraftFoodLog[] =>
  foodLogModel.selectors.mealDraft(store.getState())?.foodLogs ?? [];
