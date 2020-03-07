import { connect } from 'react-redux';
import NotesTableRow from './NotesTableRow';
import { ProductDropdownItem, NoteCreateEdit, MealType, NotesForMealRequest, MealItem } from '../../models';
import { FoodDiaryState, MealOperationStatus } from '../../store';
import {
  EditNoteSuccessAction,
  EditNoteErrorAction,
  DeleteNoteSuccessAction,
  DeleteNoteErrorAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  SetEditableForNoteAction,
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
  getProductDropdownItems,
} from '../../action-creators';

export interface StateToPropsMapResult {
  productDropdownItems: ProductDropdownItem[];
  editableNotesIds: number[];
  mealOperationStatuses: MealOperationStatus[];
  isProductDropdownContentLoading: boolean;
  isPageOperationInProcess: boolean;
}

export interface DispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  editNote: (note: NoteCreateEdit) => Promise<EditNoteSuccessAction | EditNoteErrorAction>;
  deleteNote: (request: [number, MealType]) => Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>;
  getNotesForMeal: (request: NotesForMealRequest) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
  getProductDropdownItems: () => Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productDropdownItems: state.products.dropdown.productDropdownItems,
    editableNotesIds: state.notes.list.editableNotesIds,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
    isPageOperationInProcess: state.pages.operations.status.performing,
  };
};

type NotesTableDispatchType = Dispatch<SetEditableForNoteAction> &
  ThunkDispatch<void, NoteCreateEdit, EditNoteSuccessAction | EditNoteErrorAction> &
  ThunkDispatch<void, [number, MealType], DeleteNoteSuccessAction | DeleteNoteErrorAction> &
  ThunkDispatch<MealItem, NotesForMealRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction> &
  ThunkDispatch<ProductDropdownItem[], void, GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;

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
    getProductDropdownItems: (): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
      return dispatch(getProductDropdownItems());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTableRow);
