import { connect } from 'react-redux';
import NotesTableRowEditable from './NotesTableRowEditable';
import {
  ProductDropdownItem,
  PagesFilter,
  NoteEditRequest,
  NotesForMealSearchRequest,
  ProductDropdownSearchRequest,
} from '../../models';
import { DataFetchState, MealOperationStatus, RootState } from '../../store';
import {
  EditNoteDispatchProp,
  GetProductDropdownItemsDispatchProp,
  GetNotesForMealDispatchProp,
  GetPagesListDispatchProp,
  SetEditableForNoteAction,
  EditNoteDispatch,
  GetProductDropdownItemsDispatch,
  GetNotesForMealDispatch,
  GetPagesListDispatch,
} from '../../action-types';
import {
  editNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
  setEditableForNote,
} from '../../action-creators';
import { Dispatch } from 'redux';

type NotesTableRowEditableDispatch = Dispatch<SetEditableForNoteAction> &
  EditNoteDispatch &
  GetProductDropdownItemsDispatch &
  GetNotesForMealDispatch &
  GetPagesListDispatch;

export interface NotesTableRowEditableStateToPropsMapResult {
  productDropdownItems: ProductDropdownItem[];
  productDropdownItemsFetchState: DataFetchState;
  mealOperationStatuses: MealOperationStatus[];
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface NotesTableRowEditableDispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  editNote: EditNoteDispatchProp;
  getProductDropdownItems: GetProductDropdownItemsDispatchProp;
  getNotesForMeal: GetNotesForMealDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: RootState): NotesTableRowEditableStateToPropsMapResult => {
  return {
    productDropdownItems: state.products.dropdown.productDropdownItems,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    productDropdownItemsFetchState: state.products.dropdown.productDropdownItemsFetchState,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: NotesTableRowEditableDispatch): NotesTableRowEditableDispatchToPropsMapResult => {
  const editNoteProp: EditNoteDispatchProp = (request: NoteEditRequest) => {
    return dispatch(editNote(request));
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
    getNotesForMeal: getNotesForMealProp,
    getProductDropdownItems: getProductDropdownItemsProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTableRowEditable);
