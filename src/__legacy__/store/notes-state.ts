import { MealType, NoteItem } from '../models';
import { DataFetchState, DataOperationState } from './common';

export interface NotesState {
  list: NotesListState;
  operations: NotesOperationsState;
}

export interface NotesListState {
  noteItems: NoteItem[];
  notesForPageFetchState: DataFetchState;
  notesForMealFetchStates: NotesForMealFetchState[];
}

export interface NotesOperationsState {
  mealOperationStatuses: MealOperationStatus[];
}

export interface NotesForMealFetchState extends DataFetchState {
  mealType: MealType;
}

export interface MealOperationStatus extends DataOperationState {
  mealType: MealType;
}
