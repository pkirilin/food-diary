import { NoteItem, NotesSearchRequest, NotesForMealSearchRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

export enum NotesListActionTypes {
  RequestForPage = 'NOTES_LIST__REQUEST_FOR_PAGE',
  SuccessForPage = 'NOTES_LIST__SUCCESS_FOR_PAGE',
  ErrorForPage = 'NOTES_LIST__ERROR_FOR_PAGE',

  RequestForMeal = 'NOTES_LIST__REQUEST_FOR_MEAL',
  SuccessForMeal = 'NOTES_LIST__SUCCESS_FOR_MEAL',
  ErrorForMeal = 'NOTES_LIST__ERROR_FOR_MEAL',
}

export type GetNotesForPageActions = ThunkHelperAllActions<
  NotesListActionTypes.RequestForPage,
  NotesListActionTypes.SuccessForPage,
  NotesListActionTypes.ErrorForPage,
  NoteItem[],
  NotesSearchRequest
>;

export type GetNotesForMealActions = ThunkHelperAllActions<
  NotesListActionTypes.RequestForMeal,
  NotesListActionTypes.SuccessForMeal,
  NotesListActionTypes.ErrorForMeal,
  NoteItem[],
  NotesForMealSearchRequest
>;

export type GetNotesForPageResultActions = ThunkHelperResultActions<
  NotesListActionTypes.SuccessForPage,
  NotesListActionTypes.ErrorForPage,
  NoteItem[],
  NotesSearchRequest
>;

export type GetNotesForMealResultActions = ThunkHelperResultActions<
  NotesListActionTypes.SuccessForMeal,
  NotesListActionTypes.ErrorForMeal,
  NoteItem[],
  NotesForMealSearchRequest
>;

export type NotesListActions = GetNotesForPageActions | GetNotesForMealActions;

export type GetNotesForPageDispatch = ThunkDispatch<NoteItem[], NotesSearchRequest, GetNotesForPageResultActions>;

export type GetNotesForMealDispatch = ThunkDispatch<
  NoteItem[],
  NotesForMealSearchRequest,
  GetNotesForMealResultActions
>;

export type GetNotesForPageDispatchProp = (request: NotesSearchRequest) => Promise<GetNotesForPageResultActions>;

export type GetNotesForMealDispatchProp = (request: NotesForMealSearchRequest) => Promise<GetNotesForMealResultActions>;
