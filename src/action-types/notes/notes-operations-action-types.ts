import { Action, ActionCreator } from 'redux';
import { NoteCreateEdit, MealType, NoteDeleteRequest } from '../../models';
import { NoteEditRequest } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

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

export interface EditNoteRequestAction extends Action<NotesOperationsActionTypes.EditRequest> {
  type: NotesOperationsActionTypes.EditRequest;
  request: NoteEditRequest;
  operationMessage: string;
}

export interface EditNoteSuccessAction extends Action<NotesOperationsActionTypes.EditSuccess> {
  type: NotesOperationsActionTypes.EditSuccess;
  mealType: MealType;
}

export interface EditNoteErrorAction extends Action<NotesOperationsActionTypes.EditError> {
  type: NotesOperationsActionTypes.EditError;
  mealType: MealType;
  error: string;
}

export interface DeleteNoteRequestAction extends Action<NotesOperationsActionTypes.DeleteRequest> {
  type: NotesOperationsActionTypes.DeleteRequest;
  request: NoteDeleteRequest;
  operationMessage: string;
}

export interface DeleteNoteSuccessAction extends Action<NotesOperationsActionTypes.DeleteSuccess> {
  type: NotesOperationsActionTypes.DeleteSuccess;
  mealType: MealType;
}

export interface DeleteNoteErrorAction extends Action<NotesOperationsActionTypes.DeleteError> {
  type: NotesOperationsActionTypes.DeleteError;
  mealType: MealType;
  error: string;
}

export type CreateNoteActions = CreateNoteRequestAction | CreateNoteSuccessAction | CreateNoteErrorAction;

export type EditNoteActions = EditNoteRequestAction | EditNoteSuccessAction | EditNoteErrorAction;

export type DeleteNoteActions = DeleteNoteRequestAction | DeleteNoteSuccessAction | DeleteNoteErrorAction;

export type NotesOperationsActions = CreateNoteActions | EditNoteActions | DeleteNoteActions;

export type CreateNoteActionCreator = ActionCreator<
  ThunkAction<
    Promise<CreateNoteSuccessAction | CreateNoteErrorAction>,
    void,
    NoteCreateEdit,
    CreateNoteSuccessAction | CreateNoteErrorAction
  >
>;

export type EditNoteActionCreator = ActionCreator<
  ThunkAction<
    Promise<EditNoteSuccessAction | EditNoteErrorAction>,
    void,
    NoteEditRequest,
    EditNoteSuccessAction | EditNoteErrorAction
  >
>;

export type DeleteNoteActionCreator = ActionCreator<
  ThunkAction<
    Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>,
    void,
    NoteDeleteRequest,
    DeleteNoteSuccessAction | DeleteNoteErrorAction
  >
>;

export type CreateNoteDispatch = ThunkDispatch<void, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction>;

export type EditNoteDispatch = ThunkDispatch<void, NoteEditRequest, EditNoteSuccessAction | EditNoteErrorAction>;

export type DeleteNoteDispatch = ThunkDispatch<
  void,
  NoteDeleteRequest,
  DeleteNoteSuccessAction | DeleteNoteErrorAction
>;

export type CreateNoteDispatchProp = (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;

export type EditNoteDispatchProp = (request: NoteEditRequest) => Promise<EditNoteSuccessAction | EditNoteErrorAction>;

export type DeleteNoteDispatchProp = (
  request: NoteDeleteRequest,
) => Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>;
