import { MealsListState } from '../../store';
import { MealsListActions, MealsListActionTypes } from '../../action-types';
import { availableMealTypes } from '../../models';

export const initialState: MealsListState = {
  collapsedMeals: [],
};

const mealsListReducer = (state: MealsListState = initialState, action: MealsListActions): MealsListState => {
  switch (action.type) {
    case MealsListActionTypes.ExpandMeal:
      return {
        collapsedMeals: state.collapsedMeals.filter(mt => mt !== action.meal),
      };
    case MealsListActionTypes.CollapseMeal:
      return {
        collapsedMeals: [...state.collapsedMeals, action.meal],
      };
    case MealsListActionTypes.ExpandAllMeals:
      return {
        collapsedMeals: [],
      };
    case MealsListActionTypes.CollapseAllMeals:
      return {
        collapsedMeals: [...availableMealTypes],
      };
    default:
      return state;
  }
};

export default mealsListReducer;
