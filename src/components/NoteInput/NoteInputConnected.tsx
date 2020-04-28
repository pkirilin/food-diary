import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import {
  NoteCreateEdit,
  ProductDropdownItem,
  NotesForMealSearchRequest,
  NoteItem,
  ProductDropdownSearchRequest,
  PagesFilter,
  PageItem,
} from '../../models';
import {
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
} from '../../action-types';
import { createNote, getNotesForMeal, getProductDropdownItems, getPages } from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState, MealOperationStatus, NotesForMealFetchState } from '../../store';

export interface StateToPropsMapResult {
  mealOperationStatuses: MealOperationStatus[];
  notesForMealFetchStates: NotesForMealFetchState[];
  productDropdownItems: ProductDropdownItem[];
  noteItems: NoteItem[];
  isProductDropdownContentLoading: boolean;
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  createNote: (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;
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
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
    productDropdownItems: state.products.dropdown.productDropdownItems,
    noteItems: state.notes.list.noteItems,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter,
  };
};

type NoteInputDispatchType = ThunkDispatch<void, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction> &
  ThunkDispatch<NoteItem[], NotesForMealSearchRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction> &
  ThunkDispatch<
    ProductDropdownItem[],
    ProductDropdownSearchRequest,
    GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction
  > &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: NoteInputDispatchType): DispatchToPropsMapResult => {
  return {
    createNote: (note: NoteCreateEdit): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
      return dispatch(createNote(note));
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

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
