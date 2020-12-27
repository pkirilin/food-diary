import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import {
  NoteCreateEdit,
  ProductDropdownItem,
  NotesForMealSearchRequest,
  NoteItem,
  ProductDropdownSearchRequest,
  PagesFilter,
  NoteEditRequest,
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
  CloseModalAction,
  EditNoteDispatch,
  EditNoteDispatchProp,
} from '../../action-types';
import {
  createNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
  closeModal,
  editNote,
} from '../../action-creators';
import { RootState, DataFetchState } from '../../store';
import { Dispatch } from 'redux';

type NoteInputDispatch = Dispatch<CloseModalAction> &
  CreateNoteDispatch &
  EditNoteDispatch &
  GetNotesForMealDispatch &
  GetProductDropdownItemsDispatch &
  GetPagesListDispatch;

export interface NoteInputStateToPropsMapResult {
  productDropdownItems: ProductDropdownItem[];
  noteItems: NoteItem[];
  productDropdownItemsFetchState: DataFetchState;
  pagesFilter: PagesFilter;
}

export interface NoteInputDispatchToPropsMapResult {
  closeModal: () => void;
  createNote: CreateNoteDispatchProp;
  editNote: EditNoteDispatchProp;
  getNotesForMeal: GetNotesForMealDispatchProp;
  getProductDropdownItems: GetProductDropdownItemsDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: RootState): NoteInputStateToPropsMapResult => {
  return {
    productDropdownItems: state.products.dropdown.productDropdownItems,
    noteItems: state.notes.list.noteItems,
    productDropdownItemsFetchState: state.products.dropdown.productDropdownItemsFetchState,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: NoteInputDispatch): NoteInputDispatchToPropsMapResult => {
  const createNoteProp: CreateNoteDispatchProp = (note: NoteCreateEdit) => {
    return dispatch(createNote(note));
  };

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
    closeModal: (): void => {
      dispatch(closeModal());
    },

    createNote: createNoteProp,
    editNote: editNoteProp,
    getNotesForMeal: getNotesForMealProp,
    getProductDropdownItems: getProductDropdownItemsProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
