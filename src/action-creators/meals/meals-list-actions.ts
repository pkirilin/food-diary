import { SetCollapsedForMealAction, MealsListActionTypes, SetCollapsedForAllMealsAction } from '../../action-types';
import { MealType } from '../../models';

export const setCollapsedForMeal = (collapsed: boolean, meal: MealType): SetCollapsedForMealAction => {
  return {
    type: MealsListActionTypes.SetCollapsedForMeal,
    collapsed,
    meal,
  };
};

export const setCollapsedForAllMeals = (collapsed: boolean, meals: MealType[]): SetCollapsedForAllMealsAction => {
  return {
    type: MealsListActionTypes.SetCollapsedForAllMeals,
    collapsed,
    meals,
  };
};
