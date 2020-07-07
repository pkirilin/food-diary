import { connect } from 'react-redux';
import MealsListItem from './MealsListItem';
import { RootState, NotesForMealFetchState, ModalBody, ModalOptions, MealOperationStatus } from '../../store';
import { MealType, NoteItem } from '../../models';
import { Dispatch } from 'redux';
import { SetCollapsedForMealAction, OpenModalAction } from '../../action-types';
import { setCollapsedForMeal, openModal } from '../../action-creators';

type MealsListItemDispatch = Dispatch<SetCollapsedForMealAction | OpenModalAction>;

export interface MealsListItemStateToPropsMapResult {
  collapsedMeals: MealType[];
  notesForMealFetchStates: NotesForMealFetchState[];
  noteItems: NoteItem[];
  mealOperationStatuses: MealOperationStatus[];
}

export interface MealsListItemDispatchToPropsMapResult {
  setCollapsedForMeal: (collapsed: boolean, meal: MealType) => void;
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
    setCollapsedForMeal: (collapsed: boolean, meal: MealType): void => {
      dispatch(setCollapsedForMeal(collapsed, meal));
    },

    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsListItem);
