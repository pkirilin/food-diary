import { connect } from 'react-redux';
import NotesTableRow from './NotesTableRow';
import {
  ProductDropdownItem,
  NotesForMealSearchRequest,
  ProductDropdownSearchRequest,
  NoteDeleteRequest,
  PagesFilter,
} from '../../models';
import { RootState, MealOperationStatus } from '../../store';
import {
  SetEditableForNoteAction,
  EditNoteDispatch,
  DeleteNoteDispatch,
  GetNotesForMealDispatch,
  GetProductDropdownItemsDispatch,
  GetPagesListDispatch,
  EditNoteDispatchProp,
  DeleteNoteDispatchProp,
  GetNotesForMealDispatchProp,
  GetProductDropdownItemsDispatchProp,
  GetPagesListDispatchProp,
} from '../../action-types';
import { Dispatch } from 'redux';
import {
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
} from '../../action-creators';
import { NoteEditRequest } from '../../models';

type NotesTableDispatch = Dispatch<SetEditableForNoteAction> &
  EditNoteDispatch &
  DeleteNoteDispatch &
  GetNotesForMealDispatch &
  GetProductDropdownItemsDispatch &
  GetPagesListDispatch;

export interface NotesTableRowStateToPropsMapResult {
  productDropdownItems: ProductDropdownItem[];
  editableNotesIds: number[];
  mealOperationStatuses: MealOperationStatus[];
  isProductDropdownContentLoading: boolean;
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface NotesTableRowDispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  editNote: EditNoteDispatchProp;
  deleteNote: DeleteNoteDispatchProp;
  getNotesForMeal: GetNotesForMealDispatchProp;
  getProductDropdownItems: GetProductDropdownItemsDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: RootState): NotesTableRowStateToPropsMapResult => {
  return {
    productDropdownItems: state.products.dropdown.productDropdownItems,
    editableNotesIds: state.notes.list.editableNotesIds,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: NotesTableDispatch): NotesTableRowDispatchToPropsMapResult => {
  const editNoteProp: EditNoteDispatchProp = (request: NoteEditRequest) => {
    return dispatch(editNote(request));
  };

  const deleteNoteProp: DeleteNoteDispatchProp = (request: NoteDeleteRequest) => {
    return dispatch(deleteNote(request));
  };

  const getNotesForMealProp: GetNotesForMealDispatchProp = (request: NotesForMealSearchRequest) => {
    return dispatch(getNotesForMeal(request));
  };

  const getProductDropdownItemsProp: GetProductDropdownItemsDispatchProp = (request: ProductDropdownSearchRequest) => {
    return dispatch(getProductDropdownItems(request));
  };

  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    setEditableForNote: (noteId: number, editable: boolean): void => {
      dispatch(setEditableForNote(noteId, editable));
    },

    editNote: editNoteProp,
    deleteNote: deleteNoteProp,
    getNotesForMeal: getNotesForMealProp,
    getProductDropdownItems: getProductDropdownItemsProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTableRow);
