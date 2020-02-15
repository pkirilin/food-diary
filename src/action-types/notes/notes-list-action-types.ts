import { Action } from 'redux';
import { NotesForPage } from '../../models';

export enum NotesListActionTypes {
  RequestForPage = 'NOTES_LIST__REQUEST_FOR_PAGE',
  SuccessForPage = 'NOTES_LIST__SUCCESS_FOR_PAGE',
  ErrorForPage = 'NOTES_LIST__ERROR_FOR_PAGE',
}

export interface GetNotesForPageRequestAction extends Action<NotesListActionTypes.RequestForPage> {
  type: NotesListActionTypes.RequestForPage;
}

export interface GetNotesForPageSuccessAction extends Action<NotesListActionTypes.SuccessForPage> {
  type: NotesListActionTypes.SuccessForPage;
  notesForPage: NotesForPage;
}

export interface GetNotesForPageErrorAction extends Action<NotesListActionTypes.ErrorForPage> {
  type: NotesListActionTypes.ErrorForPage;
  errorMessage: string;
}

export type NotesListActions = GetNotesForPageRequestAction | GetNotesForPageSuccessAction | GetNotesForPageErrorAction;
