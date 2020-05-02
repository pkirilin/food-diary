import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import {
  NoteCreateEdit,
  ProductDropdownItem,
  NotesForMealSearchRequest,
  NoteItem,
  ProductDropdownSearchRequest,
  PagesFilter,
} from '../../models';
import {
  CreateNoteDispatch,
  GetNotesForMealDispatch,
  GetProductDropdownItemsDispatch,
  GetPagesListDispatch,
  CreateNoteDispatchProp,
  GetNotesForMealDispatchProp,
  GetProductDropdownItemsDispatchProp,
  GetPagesListDispatchProp,
} from '../../action-types';
import { createNote, getNotesForMeal, getProductDropdownItems, getPages } from '../../action-creators';
import { FoodDiaryState, MealOperationStatus, NotesForMealFetchState } from '../../store';

type NoteInputDispatch = CreateNoteDispatch &
  GetNotesForMealDispatch &
  GetProductDropdownItemsDispatch &
  GetPagesListDispatch;

export interface NoteInputStateToPropsMapResult {
  mealOperationStatuses: MealOperationStatus[];
  notesForMealFetchStates: NotesForMealFetchState[];
  productDropdownItems: ProductDropdownItem[];
  noteItems: NoteItem[];
  isProductDropdownContentLoading: boolean;
  isPageOperationInProcess: boolean;
  pagesFilter: PagesFilter;
}

export interface NoteInputDispatchToPropsMapResult {
  createNote: CreateNoteDispatchProp;
  getNotesForMeal: GetNotesForMealDispatchProp;
  getProductDropdownItems: GetProductDropdownItemsDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): NoteInputStateToPropsMapResult => {
  return {
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
    productDropdownItems: state.products.dropdown.productDropdownItems,
    noteItems: state.notes.list.noteItems,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
    isPageOperationInProcess: state.pages.operations.status.performing,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: NoteInputDispatch): NoteInputDispatchToPropsMapResult => {
  const createNoteProp: CreateNoteDispatchProp = (note: NoteCreateEdit) => {
    return dispatch(createNote(note));
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
    createNote: createNoteProp,
    getNotesForMeal: getNotesForMealProp,
    getProductDropdownItems: getProductDropdownItemsProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
