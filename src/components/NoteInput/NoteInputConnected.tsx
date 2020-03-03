import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import { NoteCreateEdit, NotesForMealRequest, MealItem, ProductDropdownItem } from '../../models';
import {
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
} from '../../action-types';
import { createNote, getNotesForMeal, getProductDropdownItems } from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState, MealOperationStatus, NotesForMealFetchState } from '../../store';

export interface StateToPropsMapResult {
  mealOperationStatuses: MealOperationStatus[];
  notesForMealFetchStates: NotesForMealFetchState[];
  productDropdownItems: ProductDropdownItem[];
  isProductDropdownContentLoading: boolean;
}

export interface DispatchToPropsMapResult {
  createNote: (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;
  getNotesForMeal: (request: NotesForMealRequest) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
  getProductDropdownItems: () => Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
    productDropdownItems: state.products.dropdown.productDropdownItems,
    isProductDropdownContentLoading: state.products.dropdown.productDropdownItemsFetchState.loading,
  };
};

type NoteInputDispatchType = ThunkDispatch<void, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction> &
  ThunkDispatch<MealItem, NotesForMealRequest, GetNotesForMealSuccessAction | GetNotesForMealErrorAction> &
  ThunkDispatch<ProductDropdownItem[], void, GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;

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
    getProductDropdownItems: (): Promise<GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction> => {
      return dispatch(getProductDropdownItems());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
