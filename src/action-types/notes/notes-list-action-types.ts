import { Action, ActionCreator } from 'redux';
import { NoteItem, MealType, NotesSearchRequest, NotesForMealSearchRequest } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export enum NotesListActionTypes {
  RequestForPage = 'NOTES_LIST__REQUEST_FOR_PAGE',
  SuccessForPage = 'NOTES_LIST__SUCCESS_FOR_PAGE',
  ErrorForPage = 'NOTES_LIST__ERROR_FOR_PAGE',

  RequestForMeal = 'NOTES_LIST__REQUEST_FOR_MEAL',
  SuccessForMeal = 'NOTES_LIST__SUCCESS_FOR_MEAL',
  ErrorForMeal = 'NOTES_LIST__ERROR_FOR_MEAL',

  SetEditable = 'NOTES_LIST__SET_EDITABLE_FOR_NOTE',
}

export interface GetNotesForPageRequestAction extends Action<NotesListActionTypes.RequestForPage> {
  type: NotesListActionTypes.RequestForPage;
}

export interface GetNotesForPageSuccessAction extends Action<NotesListActionTypes.SuccessForPage> {
  type: NotesListActionTypes.SuccessForPage;
  noteItems: NoteItem[];
}

export interface GetNotesForPageErrorAction extends Action<NotesListActionTypes.ErrorForPage> {
  type: NotesListActionTypes.ErrorForPage;
  errorMessage: string;
}

export interface GetNotesForMealRequestAction extends Action<NotesListActionTypes.RequestForMeal> {
  type: NotesListActionTypes.RequestForMeal;
  mealType: MealType;
}

export interface GetNotesForMealSuccessAction extends Action<NotesListActionTypes.SuccessForMeal> {
  type: NotesListActionTypes.SuccessForMeal;
  mealType: MealType;
  noteItems: NoteItem[];
}

export interface GetNotesForMealErrorAction extends Action<NotesListActionTypes.ErrorForMeal> {
  type: NotesListActionTypes.ErrorForMeal;
  mealType: MealType;
  errorMessage: string;
}

export interface SetEditableForNoteAction extends Action<NotesListActionTypes.SetEditable> {
  type: NotesListActionTypes.SetEditable;
  noteId: number;
  editable: boolean;
}

export type GetNotesForPageActions =
  | GetNotesForPageRequestAction
  | GetNotesForPageSuccessAction
  | GetNotesForPageErrorAction;

export type GetNotesForMealActions =
  | GetNotesForMealRequestAction
  | GetNotesForMealSuccessAction
  | GetNotesForMealErrorAction;

export type NotesListActions = GetNotesForPageActions | GetNotesForMealActions | SetEditableForNoteAction;

export type GetNotesForPageActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>,
    NoteItem[],
    NotesSearchRequest,
    GetNotesForPageSuccessAction | GetNotesForPageErrorAction
  >
>;

export type GetNotesForMealActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>,
    NoteItem[],
    NotesForMealSearchRequest,
    GetNotesForMealSuccessAction | GetNotesForMealErrorAction
  >
>;

export type GetNotesForPageDispatch = ThunkDispatch<
  NoteItem[],
  NotesSearchRequest,
  GetNotesForPageSuccessAction | GetNotesForPageErrorAction
>;

export type GetNotesForMealDispatch = ThunkDispatch<
  NoteItem[],
  NotesForMealSearchRequest,
  GetNotesForMealSuccessAction | GetNotesForMealErrorAction
>;

export type GetNotesForPageDispatchProp = (
  request: NotesSearchRequest,
) => Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;

export type GetNotesForMealDispatchProp = (
  request: NotesForMealSearchRequest,
) => Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>;
