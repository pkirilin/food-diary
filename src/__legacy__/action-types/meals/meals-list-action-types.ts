import { Action } from 'redux';
import { MealType } from '../../models';

export enum MealsListActionTypes {
  ExpandMeal = 'MEALS_LIST_EXPAND',
  CollapseMeal = 'MEALS_LIST_COLLAPSE',
  ExpandAllMeals = 'MEALS_LIST_EXPAND_ALL',
  CollapseAllMeals = 'MEALS_LIST_COLLAPSE_ALL',
}

export interface ExpandMealAction extends Action<MealsListActionTypes.ExpandMeal> {
  type: MealsListActionTypes.ExpandMeal;
  meal: MealType;
}

export interface CollapseMealAction extends Action<MealsListActionTypes.CollapseMeal> {
  type: MealsListActionTypes.CollapseMeal;
  meal: MealType;
}

export interface ExpandAllMealsAction extends Action<MealsListActionTypes.ExpandAllMeals> {
  type: MealsListActionTypes.ExpandAllMeals;
}

export interface CollapseAllMealsAction extends Action<MealsListActionTypes.CollapseAllMeals> {
  type: MealsListActionTypes.CollapseAllMeals;
}

export type MealsListActions = ExpandMealAction | CollapseMealAction | ExpandAllMealsAction | CollapseAllMealsAction;
