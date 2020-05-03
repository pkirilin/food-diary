import { connect } from 'react-redux';
import NotesTableRow from './NotesTableRow';
import { NotesForMealSearchRequest, NoteDeleteRequest, PagesFilter } from '../../models';
import { RootState, MealOperationStatus } from '../../store';
import {
  SetEditableForNoteAction,
  EditNoteDispatch,
  DeleteNoteDispatch,
  GetNotesForMealDispatch,
  GetProductDropdownItemsDispatch,
  GetPagesListDispatch,
  DeleteNoteDispatchProp,
  GetNotesForMealDispatchProp,
  GetPagesListDispatchProp,
} from '../../action-types';
import { Dispatch } from 'redux';
import { setEditableForNote, deleteNote, getNotesForMeal, getPages } from '../../action-creators';

type NotesTableRowDispatch = Dispatch<SetEditableForNoteAction> &
  EditNoteDispatch &
  DeleteNoteDispatch &
  GetNotesForMealDispatch &
  GetProductDropdownItemsDispatch &
  GetPagesListDispatch;

export interface NotesTableRowStateToPropsMapResult {
  editableNotesIds: number[];
  mealOperationStatuses: MealOperationStatus[];
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface NotesTableRowDispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  deleteNote: DeleteNoteDispatchProp;
  getNotesForMeal: GetNotesForMealDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: RootState): NotesTableRowStateToPropsMapResult => {
  return {
    editableNotesIds: state.notes.list.editableNotesIds,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: NotesTableRowDispatch): NotesTableRowDispatchToPropsMapResult => {
  const deleteNoteProp: DeleteNoteDispatchProp = (request: NoteDeleteRequest) => {
    return dispatch(deleteNote(request));
  };

  const getNotesForMealProp: GetNotesForMealDispatchProp = (request: NotesForMealSearchRequest) => {
    return dispatch(getNotesForMeal(request));
  };

  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    setEditableForNote: (noteId: number, editable: boolean): void => {
      dispatch(setEditableForNote(noteId, editable));
    },

    deleteNote: deleteNoteProp,
    getNotesForMeal: getNotesForMealProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTableRow);
