import { NotesListActionTypes } from '../../action-types';
import { NoteItem, NotesForMealSearchRequest, NotesSearchRequest } from '../../models';
import {
  ApiRequestUrlModifier,
  createErrorResponseHandler,
  createSuccessJsonResponseHandler,
  createAsyncAction,
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

export const getNotesForPage = createAsyncAction<
  NoteItem[],
  NotesSearchRequest,
  NotesListActionTypes.RequestForPage,
  NotesListActionTypes.SuccessForPage,
  NotesListActionTypes.ErrorForPage
>(
  NotesListActionTypes.RequestForPage,
  NotesListActionTypes.SuccessForPage,
  NotesListActionTypes.ErrorForPage,
  {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'GET',
    modifyUrl: modifyUrlByNotesSearchRequest,
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get notes for page', {
      404: () => 'page not found',
    }),
  },
  'Loading page content',
);

export const getNotesForMeal = createAsyncAction<
  NoteItem[],
  NotesForMealSearchRequest,
  NotesListActionTypes.RequestForMeal,
  NotesListActionTypes.SuccessForMeal,
  NotesListActionTypes.ErrorForMeal
>(
  NotesListActionTypes.RequestForMeal,
  NotesListActionTypes.SuccessForMeal,
  NotesListActionTypes.ErrorForMeal,
  {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'GET',
    modifyUrl: modifyUrlByNotesSearchRequest,
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get notes for meal'),
  },
  'Loading notes',
);
