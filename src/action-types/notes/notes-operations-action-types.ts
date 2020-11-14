import { NoteCreateEdit, NoteDeleteRequest } from '../../models';
import { NoteEditRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

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

export type CreateNoteActions = ThunkHelperAllActions<
  NotesOperationsActionTypes.CreateRequest,
  NotesOperationsActionTypes.CreateSuccess,
  NotesOperationsActionTypes.CreateError,
  {},
  NoteCreateEdit
>;

export type EditNoteActions = ThunkHelperAllActions<
  NotesOperationsActionTypes.EditRequest,
  NotesOperationsActionTypes.EditSuccess,
  NotesOperationsActionTypes.EditError,
  {},
  NoteEditRequest
>;

export type DeleteNoteActions = ThunkHelperAllActions<
  NotesOperationsActionTypes.DeleteRequest,
  NotesOperationsActionTypes.DeleteSuccess,
  NotesOperationsActionTypes.DeleteError,
  {},
  NoteDeleteRequest
>;

export type CreateNoteResultActions = ThunkHelperResultActions<
  NotesOperationsActionTypes.CreateSuccess,
  NotesOperationsActionTypes.CreateError,
  {},
  NoteCreateEdit
>;

export type EditNoteResultActions = ThunkHelperResultActions<
  NotesOperationsActionTypes.EditSuccess,
  NotesOperationsActionTypes.EditError,
  {},
  NoteEditRequest
>;

export type DeleteNoteResultActions = ThunkHelperResultActions<
  NotesOperationsActionTypes.DeleteSuccess,
  NotesOperationsActionTypes.DeleteError,
  {},
  NoteDeleteRequest
>;

export type NotesOperationsActions = CreateNoteActions | EditNoteActions | DeleteNoteActions;

export type CreateNoteDispatch = ThunkDispatch<{}, NoteCreateEdit, CreateNoteResultActions>;

export type EditNoteDispatch = ThunkDispatch<{}, NoteEditRequest, EditNoteResultActions>;

export type DeleteNoteDispatch = ThunkDispatch<{}, NoteDeleteRequest, DeleteNoteResultActions>;

export type CreateNoteDispatchProp = (note: NoteCreateEdit) => Promise<CreateNoteResultActions>;

export type EditNoteDispatchProp = (request: NoteEditRequest) => Promise<EditNoteResultActions>;

export type DeleteNoteDispatchProp = (request: NoteDeleteRequest) => Promise<DeleteNoteResultActions>;
