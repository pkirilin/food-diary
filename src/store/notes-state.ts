import { DataFetchState } from './data-fetch-state';
import { NotesForPage, MealType } from '../models';
import { DataOperationState } from './data-operation-state';

export interface NotesState {
  list: NotesListState;
  operations: NotesOperationsState;
}

export interface NotesListState {
  notesForPage: NotesForPageState;
  notesForPageFetchState: DataFetchState;
  notesForMealFetchStates: NotesForMealFetchState[];
}

export interface NotesOperationsState {
  mealOperationStatuses: MealOperationStatus[];
}

export type NotesForPageState = NotesForPage | null;

export interface NotesForMealFetchState extends DataFetchState {
  mealType: MealType;
}

export interface MealOperationStatus extends DataOperationState {
  mealType: MealType;
}
