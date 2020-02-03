import { Action } from 'redux';
import { MealType } from '../../models';

export enum MealsListActionTypes {
  SetCollapsedForMeal = 'MEALS_LIST__SET_COLLAPSED_FOR_MEAL',
  SetCollapsedForAllMeals = 'MEALS_LIST_SET_COLLAPSED_FOR_ALL_MEALS',
}

export interface SetCollapsedForMealAction extends Action<MealsListActionTypes.SetCollapsedForMeal> {
  type: MealsListActionTypes.SetCollapsedForMeal;
  collapsed: boolean;
  meal: MealType;
}

export interface SetCollapsedForAllMealsAction extends Action<MealsListActionTypes.SetCollapsedForAllMeals> {
  type: MealsListActionTypes.SetCollapsedForAllMeals;
  collapsed: boolean;
  meals: MealType[];
}

export type MealsListActions = SetCollapsedForMealAction | SetCollapsedForAllMealsAction;
