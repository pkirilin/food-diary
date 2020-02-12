import { DataFetchState } from './data-fetch-state';
import { NotesForPage } from '../models';
import { DataOperationState } from './data-operation-state';

export interface NotesState {
  list: NotesListState;
  operations: NotesOperationsState;
}

export type NotesForPageState = NotesForPage | null;

export interface NotesListState {
  notesForPage: DataFetchState<NotesForPageState, string>;
}

export interface NotesOperationsState {
  status: DataOperationState;
}
