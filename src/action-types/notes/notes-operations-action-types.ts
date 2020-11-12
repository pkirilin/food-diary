import { NoteCreateEdit, MealType, NoteDeleteRequest } from '../../models';
import { NoteEditRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ErrorAction, RequestAction, SuccessAction } from '../../helpers';

export enum NotesOperationsActionTypes {
  CreateRequest = 'NOTES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'NOTES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'NOTES_OPERATIONS__CREATE_ERROR',

  EditRequest = 'NOTES_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'NOTES_OPERATIONS__EDIT_SUCCESS',
  EditError = 'NOTES_OPERATIONS__EDIT_ERROR',

  DeleteRequest = 'NOTES_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'NOTES_OPERATIONS__DELETE_SUCCESS',
  DeleteError = 'NOTES_OPERATIONS__DELETE_ERROR',
}

export type CreateNoteRequestAction = RequestAction<NotesOperationsActionTypes.CreateRequest, NoteCreateEdit>;

export interface CreateNoteSuccessAction extends SuccessAction<NotesOperationsActionTypes.CreateSuccess> {
  mealType: MealType;
}

export interface CreateNoteErrorAction extends ErrorAction<NotesOperationsActionTypes.CreateError> {
  mealType: MealType;
}

export type EditNoteRequestAction = RequestAction<NotesOperationsActionTypes.EditRequest, NoteEditRequest>;

export interface EditNoteSuccessAction extends SuccessAction<NotesOperationsActionTypes.EditSuccess> {
  mealType: MealType;
}

export interface EditNoteErrorAction extends ErrorAction<NotesOperationsActionTypes.EditError> {
  mealType: MealType;
}

export type DeleteNoteRequestAction = RequestAction<NotesOperationsActionTypes.DeleteRequest, NoteDeleteRequest>;

export interface DeleteNoteSuccessAction extends SuccessAction<NotesOperationsActionTypes.DeleteSuccess> {
  mealType: MealType;
}

export interface DeleteNoteErrorAction extends ErrorAction<NotesOperationsActionTypes.DeleteError> {
  mealType: MealType;
}

export type CreateNoteActions = CreateNoteRequestAction | CreateNoteSuccessAction | CreateNoteErrorAction;

export type EditNoteActions = EditNoteRequestAction | EditNoteSuccessAction | EditNoteErrorAction;

export type DeleteNoteActions = DeleteNoteRequestAction | DeleteNoteSuccessAction | DeleteNoteErrorAction;

export type NotesOperationsActions = CreateNoteActions | EditNoteActions | DeleteNoteActions;

export type CreateNoteDispatch = ThunkDispatch<{}, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction>;

export type EditNoteDispatch = ThunkDispatch<{}, NoteEditRequest, EditNoteSuccessAction | EditNoteErrorAction>;

export type DeleteNoteDispatch = ThunkDispatch<{}, NoteDeleteRequest, DeleteNoteSuccessAction | DeleteNoteErrorAction>;

export type CreateNoteDispatchProp = (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;

export type EditNoteDispatchProp = (request: NoteEditRequest) => Promise<EditNoteSuccessAction | EditNoteErrorAction>;

export type DeleteNoteDispatchProp = (
  request: NoteDeleteRequest,
) => Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>;
