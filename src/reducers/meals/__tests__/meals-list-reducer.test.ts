import {
  CollapseAllMealsAction,
  CollapseMealAction,
  ExpandAllMealsAction,
  ExpandMealAction,
  MealsListActionTypes,
} from '../../../action-types';
import { availableMealTypes, MealType } from '../../../models';
import { MealsListState } from '../../../store';
import mealsListReducer, { initialState } from '../meals-list-reducer';

describe('meals list reducer', () => {
  test('should handle collapsing meal', () => {
    const meal = MealType.Breakfast;
    const action: CollapseMealAction = {
      type: MealsListActionTypes.CollapseMeal,
      meal,
    };
    const expectedState: MealsListState = {
      collapsedMeals: [meal],
    };

    const nextState = mealsListReducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  test('should handle expanding meal', () => {
    const targetMeal = MealType.Breakfast;
    const otherMeals: MealType[] = [MealType.Lunch];
    const action: ExpandMealAction = {
      type: MealsListActionTypes.ExpandMeal,
      meal: targetMeal,
    };
    const state: MealsListState = {
      collapsedMeals: [...otherMeals, targetMeal],
    };
    const expectedState: MealsListState = {
      collapsedMeals: [...otherMeals],
    };

    const nextState = mealsListReducer(state, action);

    expect(nextState).toEqual(expectedState);
  });

  test('should handle collapsing all meals', () => {
    const action: CollapseAllMealsAction = {
      type: MealsListActionTypes.CollapseAllMeals,
    };
    const expectedState: MealsListState = {
      collapsedMeals: [...availableMealTypes],
    };

    const nextState = mealsListReducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  test('should handle expanding all meals', () => {
    const action: ExpandAllMealsAction = {
      type: MealsListActionTypes.ExpandAllMeals,
    };
    const state: MealsListState = {
      collapsedMeals: [...availableMealTypes],
    };
    const expectedState: MealsListState = {
      collapsedMeals: [],
    };

    const nextState = mealsListReducer(state, action);

    expect(nextState).toEqual(expectedState);
  });
});
