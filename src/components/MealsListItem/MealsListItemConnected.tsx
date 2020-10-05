import { connect } from 'react-redux';
import MealsListItem from './MealsListItem';
import { RootState, NotesForMealFetchState, ModalBody, ModalOptions, MealOperationStatus } from '../../store';
import { MealType, NoteItem } from '../../models';
import { Dispatch } from 'redux';
import { CollapseMealAction, ExpandMealAction, OpenModalAction } from '../../action-types';
import { collapseMeal, expandMeal, openModal } from '../../action-creators';

type MealsListItemDispatch = Dispatch<ExpandMealAction | CollapseMealAction | OpenModalAction>;

export interface MealsListItemStateToPropsMapResult {
  collapsedMeals: MealType[];
  notesForMealFetchStates: NotesForMealFetchState[];
  noteItems: NoteItem[];
  mealOperationStatuses: MealOperationStatus[];
}

export interface MealsListItemDispatchToPropsMapResult {
  expandMeal: (meal: MealType) => void;
  collapseMeal: (meal: MealType) => void;
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
}

const mapStateToProps = (state: RootState): MealsListItemStateToPropsMapResult => {
  return {
    collapsedMeals: state.meals.list.collapsedMeals,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
    noteItems: state.notes.list.noteItems,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
  };
};

const mapDispatchToProps = (dispatch: MealsListItemDispatch): MealsListItemDispatchToPropsMapResult => {
  return {
    expandMeal: (meal: MealType): void => {
      dispatch(expandMeal(meal));
    },
    collapseMeal: (meal: MealType): void => {
      dispatch(collapseMeal(meal));
    },
    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsListItem);
