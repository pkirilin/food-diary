import { NoteItem, MealType, NotesSearchRequest, NotesForMealSearchRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ErrorAction, RequestAction, SuccessAction } from '../../helpers';

export enum NotesListActionTypes {
  RequestForPage = 'NOTES_LIST__REQUEST_FOR_PAGE',
  SuccessForPage = 'NOTES_LIST__SUCCESS_FOR_PAGE',
  ErrorForPage = 'NOTES_LIST__ERROR_FOR_PAGE',

  RequestForMeal = 'NOTES_LIST__REQUEST_FOR_MEAL',
  SuccessForMeal = 'NOTES_LIST__SUCCESS_FOR_MEAL',
  ErrorForMeal = 'NOTES_LIST__ERROR_FOR_MEAL',
}

export type GetNotesForPageRequestAction = RequestAction<NotesListActionTypes.RequestForPage, NotesSearchRequest>;
export type GetNotesForPageSuccessAction = SuccessAction<NotesListActionTypes.SuccessForPage, NoteItem[]>;
export type GetNotesForPageErrorAction = ErrorAction<NotesListActionTypes.ErrorForPage>;

export type GetNotesForMealRequestAction = RequestAction<
  NotesListActionTypes.RequestForMeal,
  NotesForMealSearchRequest
>;
export interface GetNotesForMealSuccessAction extends SuccessAction<NotesListActionTypes.SuccessForMeal, NoteItem[]> {
  mealType: MealType;
}
export interface GetNotesForMealErrorAction extends ErrorAction<NotesListActionTypes.ErrorForMeal> {
  mealType: MealType;
}

export type GetNotesForPageActions =
  | GetNotesForPageRequestAction
  | GetNotesForPageSuccessAction
  | GetNotesForPageErrorAction;

export type GetNotesForMealActions =
  | GetNotesForMealRequestAction
  | GetNotesForMealSuccessAction
  | GetNotesForMealErrorAction;

export type NotesListActions = GetNotesForPageActions | GetNotesForMealActions;

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
