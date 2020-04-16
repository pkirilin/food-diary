import { Action } from 'redux';
import { MealType, MealItem } from '../../models';

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
  mealItemsWithNotes: MealItem[];
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
  mealItem: MealItem;
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

export type NotesListActions =
  | GetNotesForPageRequestAction
  | GetNotesForPageSuccessAction
  | GetNotesForPageErrorAction
  | GetNotesForMealRequestAction
  | GetNotesForMealSuccessAction
  | GetNotesForMealErrorAction
  | SetEditableForNoteAction;
