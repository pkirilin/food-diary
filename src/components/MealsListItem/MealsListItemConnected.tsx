import { connect } from 'react-redux';
import MealsListItem from './MealsListItem';
import { FoodDiaryState, NotesForMealFetchState } from '../../store';
import { MealType, NoteItem } from '../../models';
import { Dispatch } from 'redux';
import { SetCollapsedForMealAction } from '../../action-types';
import { setCollapsedForMeal } from '../../action-creators';

export interface StateToPropsMapResult {
  collapsedMeals: MealType[];
  notesForMealFetchStates: NotesForMealFetchState[];
  noteItems: NoteItem[];
}

export interface DispatchToPropsMapResult {
  setCollapsedForMeal: (collapsed: boolean, meal: MealType) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    collapsedMeals: state.meals.list.collapsedMeals,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
    noteItems: state.notes.list.noteItems,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<SetCollapsedForMealAction>): DispatchToPropsMapResult => {
  return {
    setCollapsedForMeal: (collapsed: boolean, meal: MealType): void => {
      dispatch(setCollapsedForMeal(collapsed, meal));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsListItem);
