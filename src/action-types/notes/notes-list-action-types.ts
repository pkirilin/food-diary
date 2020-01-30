import { Action } from 'redux';
import { NotesForPage } from '../../models';

export enum NotesListActionTypes {
  Request = 'NOTES_LIST__REQUEST',
  Success = 'NOTES_LIST__SUCCESS',
  Error = 'NOTES_LIST__ERROR',
}

export interface GetNotesListRequestAction extends Action<NotesListActionTypes.Request> {
  type: NotesListActionTypes.Request;
}

export interface GetNotesListSuccessAction extends Action<NotesListActionTypes.Success> {
  type: NotesListActionTypes.Success;
  notes: NotesForPage;
}

export interface GetNotesListErrorAction extends Action<NotesListActionTypes.Error> {
  type: NotesListActionTypes.Error;
  errorMessage: string;
}

export type NotesListActions = GetNotesListRequestAction | GetNotesListSuccessAction | GetNotesListErrorAction;
