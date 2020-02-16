import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import { NoteCreateEdit, NotesForMealRequest, MealItem } from '../../models';
import {
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
} from '../../action-types';
import { createNote, getNotesForMeal } from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState, MealOperationStatus, NotesForMealFetchState } from '../../store';

export interface StateToPropsMapResult {
  mealOperationStatuses: MealOperationStatus[];
  notesForMealFetchStates: NotesForMealFetchState[];
}

export interface DispatchToPropsMapResult {
  createNote: (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;
  getNotesForMeal: (request: NotesForMealRequest) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
  };
};

type NoteInputDispatchType = ThunkDispatch<void, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction> &
  ThunkDispatch<MealItem, NotesForMealRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;

const mapDispatchToProps = (dispatch: NoteInputDispatchType): DispatchToPropsMapResult => {
  return {
    createNote: (note: NoteCreateEdit): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
      return dispatch(createNote(note));
    },
    getNotesForMeal: (
      request: NotesForMealRequest,
    ): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
      return dispatch(getNotesForMeal(request));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
