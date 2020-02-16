import { Action } from 'redux';
import { NoteCreateEdit, MealType } from '../../models';

export enum NotesOperationsActionTypes {
  CreateRequest = 'NOTES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'NOTES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'NOTES_OPERATIONS__CREATE_ERROR',
}

export interface CreateNoteRequestAction extends Action<NotesOperationsActionTypes.CreateRequest> {
  type: NotesOperationsActionTypes.CreateRequest;
  note: NoteCreateEdit;
  operationMessage: string;
}

export interface CreateNoteSuccessAction extends Action<NotesOperationsActionTypes.CreateSuccess> {
  type: NotesOperationsActionTypes.CreateSuccess;
  mealType: MealType;
}

export interface CreateNoteErrorAction extends Action<NotesOperationsActionTypes.CreateError> {
  type: NotesOperationsActionTypes.CreateError;
  mealType: MealType;
  error: string;
}

type CreateNoteActions = CreateNoteRequestAction | CreateNoteSuccessAction | CreateNoteErrorAction;

export type NotesOperationsActions = CreateNoteActions;
