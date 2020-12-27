import { MealType } from '../models';

export interface MealsState {
  list: MealsListState;
}

export interface MealsListState {
  collapsedMeals: MealType[];
}
