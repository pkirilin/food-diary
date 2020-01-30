import { DataFetchState } from './data-fetch-state';
import { NotesForPage } from '../models';

export interface NotesState {
  list: NotesListState;
}

export type NoteForPageState = NotesForPage | null;

export interface NotesListState {
  notesForPage: DataFetchState<NoteForPageState, string>;
}
