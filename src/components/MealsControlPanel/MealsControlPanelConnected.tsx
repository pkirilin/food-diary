import { connect } from 'react-redux';
import MealsControlPanel from '.';
import { MealType } from '../../models';
import { Dispatch } from 'redux';
import { SetCollapsedForAllMealsAction } from '../../action-types';
import { setCollapsedForAllMeals } from '../../action-creators';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  allMealTypes: MealType[];
}

export interface DispatchToPropsMapResult {
  setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    allMealTypes: state.notes.list.notesForPage ? state.notes.list.notesForPage.meals.map(m => m.type) : [],
  };
};

const mapDispatchToProps = (dispatch: Dispatch<SetCollapsedForAllMealsAction>): DispatchToPropsMapResult => {
  return {
    setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]): void => {
      dispatch(setCollapsedForAllMeals(collapsed, meals));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsControlPanel);
