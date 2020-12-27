import {
  MealsListActionTypes,
  CollapseMealAction,
  ExpandMealAction,
  CollapseAllMealsAction,
  ExpandAllMealsAction,
} from '../../action-types';
import { MealType } from '../../models';

export const collapseMeal = (meal: MealType): CollapseMealAction => ({
  type: MealsListActionTypes.CollapseMeal,
  meal,
});

export const expandMeal = (meal: MealType): ExpandMealAction => ({
  type: MealsListActionTypes.ExpandMeal,
  meal,
});

export const collapseAllMeals = (): CollapseAllMealsAction => ({
  type: MealsListActionTypes.CollapseAllMeals,
});

export const expandAllMeals = (): ExpandAllMealsAction => ({
  type: MealsListActionTypes.ExpandAllMeals,
});
