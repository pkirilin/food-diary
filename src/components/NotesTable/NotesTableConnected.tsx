import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState, NotesForPageState, MealOperationStatus } from '../../store';
import { Dispatch } from 'redux';
import {
  SetEditableForNoteAction,
  EditNoteSuccessAction,
  EditNoteErrorAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  DeleteNoteSuccessAction,
  DeleteNoteErrorAction,
} from '../../action-types';
import { setEditableForNote, editNote, getNotesForMeal, deleteNote } from '../../action-creators';
import { NoteCreateEdit, NotesForMealRequest, MealItem, MealType, ProductDropdownItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  notesForPageData: NotesForPageState;
  editableNotesIds: number[];
  mealOperationStatuses: MealOperationStatus[];
  productDropdownItems: ProductDropdownItem[];
}

export interface DispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  editNote: (note: NoteCreateEdit) => Promise<EditNoteSuccessAction | EditNoteErrorAction>;
  deleteNote: (request: [number, MealType]) => Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>;
  getNotesForMeal: (request: NotesForMealRequest) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    notesForPageData: state.notes.list.notesForPage,
    editableNotesIds: state.notes.list.editableNotesIds,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    productDropdownItems: state.products.dropdown.productDropdownItems,
  };
};

type NotesTableDispatchType = Dispatch<SetEditableForNoteAction> &
  ThunkDispatch<void, NoteCreateEdit, EditNoteSuccessAction | EditNoteErrorAction> &
  ThunkDispatch<void, [number, MealType], DeleteNoteSuccessAction | DeleteNoteErrorAction> &
  ThunkDispatch<MealItem, NotesForMealRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;

const mapDispatchToProps = (dispatch: NotesTableDispatchType): DispatchToPropsMapResult => {
  return {
    setEditableForNote: (noteId: number, editable: boolean): void => {
      dispatch(setEditableForNote(noteId, editable));
    },
    editNote: (note: NoteCreateEdit): Promise<EditNoteSuccessAction | EditNoteErrorAction> => {
      return dispatch(editNote(note));
    },
    deleteNote: (request: [number, MealType]): Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction> => {
      return dispatch(deleteNote(request));
    },
    getNotesForMeal: (
      request: NotesForMealRequest,
    ): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
      return dispatch(getNotesForMeal(request));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTable);
