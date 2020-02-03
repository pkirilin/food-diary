import { MealsListState } from '../../store';
import { MealsListActions, MealsListActionTypes } from '../../action-types';

const initialState: MealsListState = {
  collapsedMeals: [],
};

const mealsListReducer = (state: MealsListState = initialState, action: MealsListActions): MealsListState => {
  switch (action.type) {
    case MealsListActionTypes.SetCollapsedForMeal:
      return {
        ...state,
        collapsedMeals: action.collapsed
          ? [...state.collapsedMeals, action.meal]
          : state.collapsedMeals.filter(mt => mt !== action.meal),
      };
    case MealsListActionTypes.SetCollapsedForAllMeals:
      return {
        ...state,
        collapsedMeals: action.collapsed ? action.meals : [],
      };
    default:
      return state;
  }
};

export default mealsListReducer;
