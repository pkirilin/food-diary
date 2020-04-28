import { connect } from 'react-redux';
import NotesTableRow from './NotesTableRow';
import {
  ProductDropdownItem,
  NotesForMealSearchRequest,
  NoteItem,
  ProductDropdownSearchRequest,
  NoteDeleteRequest,
  PagesFilter,
  PageItem,
} from '../../models';
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
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
} from '../../action-creators';
import { NoteEditRequest } from '../../models';

export interface StateToPropsMapResult {
  productDropdownItems: ProductDropdownItem[];
  editableNotesIds: number[];
  mealOperationStatuses: MealOperationStatus[];
  isProductDropdownContentLoading: boolean;
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  setEditableForNote: (noteId: number, editable: boolean) => void;
  editNote: (request: NoteEditRequest) => Promise<EditNoteSuccessAction | EditNoteErrorAction>;
  deleteNote: (request: NoteDeleteRequest) => Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>;
  getNotesForMeal: (
    request: NotesForMealSearchRequest,
  ) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
  getProductDropdownItems: (
    request: ProductDropdownSearchRequest,
  ) => Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productDropdownItems: state.products.dropdown.productDropdownItems,
    editableNotesIds: state.notes.list.editableNotesIds,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter,
  };
};

type NotesTableDispatchType = Dispatch<SetEditableForNoteAction> &
  ThunkDispatch<void, NoteEditRequest, EditNoteSuccessAction | EditNoteErrorAction> &
  ThunkDispatch<void, NoteDeleteRequest, DeleteNoteSuccessAction | DeleteNoteErrorAction> &
  ThunkDispatch<NoteItem[], NotesForMealSearchRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction> &
  ThunkDispatch<
    ProductDropdownItem[],
    ProductDropdownSearchRequest,
    GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction
  > &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: NotesTableDispatchType): DispatchToPropsMapResult => {
  return {
    setEditableForNote: (noteId: number, editable: boolean): void => {
      dispatch(setEditableForNote(noteId, editable));
    },
    editNote: (request: NoteEditRequest): Promise<EditNoteSuccessAction | EditNoteErrorAction> => {
      return dispatch(editNote(request));
    },
    deleteNote: (request: NoteDeleteRequest): Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction> => {
      return dispatch(deleteNote(request));
    },
    getNotesForMeal: (
      request: NotesForMealSearchRequest,
    ): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
      return dispatch(getNotesForMeal(request));
    },
    getProductDropdownItems: (
      request: ProductDropdownSearchRequest,
    ): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
      return dispatch(getProductDropdownItems(request));
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesTableRow);
