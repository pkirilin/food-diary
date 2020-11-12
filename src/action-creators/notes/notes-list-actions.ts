import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetNotesForPageRequestAction,
  NotesListActionTypes,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  GetNotesForMealRequestAction,
} from '../../action-types';
import { NoteItem, NotesForMealSearchRequest, NotesSearchRequest } from '../../models';
import {
  ApiRequestUrlModifier,
  createErrorResponseHandler,
  createSuccessJsonResponseHandler,
  createThunkWithApiCall,
} from '../../helpers';
import { API_URL } from '../../config';

const modifyUrlByNotesSearchRequest: ApiRequestUrlModifier<NotesSearchRequest> = (
  baseUrl,
  { pageId, mealType },
): string => {
  let modifiedUrl = `${baseUrl}?pageId=${pageId}`;

  if (mealType) {
    modifiedUrl += `&mealType=${mealType}`;
  }

  return modifiedUrl;
};

export const getNotesForPage = createThunkWithApiCall<
  GetNotesForPageRequestAction,
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  NotesListActionTypes.RequestForPage,
  NotesListActionTypes.SuccessForPage,
  NotesListActionTypes.ErrorForPage,
  NoteItem[],
  NotesSearchRequest
>({
  makeRequest: () => {
    return (notesSearchRequest): GetNotesForPageRequestAction => {
      if (!notesSearchRequest) {
        throw new Error('Failed to load notes: notesSearchRequest is undefined');
      }

      return {
        type: NotesListActionTypes.RequestForPage,
        requestMessage: 'Loading page content',
        payload: notesSearchRequest,
      };
    };
  },
  makeSuccess: () => {
    return (_, noteItems): GetNotesForPageSuccessAction => ({
      type: NotesListActionTypes.SuccessForPage,
      data: noteItems ?? [],
    });
  },
  makeError: () => {
    return (_, receivedErrorMessage): GetNotesForPageErrorAction => ({
      type: NotesListActionTypes.ErrorForPage,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'GET',
    modifyUrl: modifyUrlByNotesSearchRequest,
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get notes for page'),
  },
});

export const getNotesForMeal = createThunkWithApiCall<
  GetNotesForMealRequestAction,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  NotesListActionTypes.RequestForMeal,
  NotesListActionTypes.SuccessForMeal,
  NotesListActionTypes.ErrorForMeal,
  NoteItem[],
  NotesForMealSearchRequest
>({
  makeRequest: () => {
    return (notesSearchRequest): GetNotesForMealRequestAction => {
      if (!notesSearchRequest) {
        throw new Error('Failed to load notes: notesSearchRequest is undefined');
      }

      return {
        type: NotesListActionTypes.RequestForMeal,
        requestMessage: 'Loading notes',
        payload: notesSearchRequest,
      };
    };
  },
  makeSuccess: () => {
    return ({ mealType }, notesResponseData): GetNotesForMealSuccessAction => {
      if (!notesResponseData) {
        throw new Error('Failed to load notes: notesResponseData is undefined');
      }

      return {
        type: NotesListActionTypes.SuccessForMeal,
        data: notesResponseData,
        mealType,
      };
    };
  },
  makeError: () => {
    return ({ mealType }, receivedError): GetNotesForMealErrorAction => {
      if (!receivedError) {
        throw new Error('Failed to load notes: receivedError is undefined');
      }

      return {
        type: NotesListActionTypes.ErrorForMeal,
        errorMessage: receivedError,
        mealType,
      };
    };
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'GET',
    modifyUrl: modifyUrlByNotesSearchRequest,
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get notes for meal'),
  },
});
