import { NotesListState, NotesForMealFetchState } from '../../store';
import { NotesListActions, NotesListActionTypes } from '../../action-types';
import { availableMealTypes } from '../../models';

const initNotesForMealFetchStates = (): NotesForMealFetchState[] => {
  const result: NotesForMealFetchState[] = [];
  availableMealTypes.forEach(mealType => {
    result.push({
      mealType,
      loading: false,
      loaded: false,
    });
  });
  return result;
};

export const initialState: NotesListState = {
  noteItems: [],
  notesForPageFetchState: {
    loading: false,
    loaded: false,
  },
  notesForMealFetchStates: initNotesForMealFetchStates(),
};

const notesListReducer = (state: NotesListState = initialState, action: NotesListActions): NotesListState => {
  switch (action.type) {
    case NotesListActionTypes.RequestForPage:
      return {
        ...state,
        notesForPageFetchState: {
          loading: true,
          loaded: false,
          loadingMessage: action.loadingMessage,
        },
      };
    case NotesListActionTypes.SuccessForPage:
      return {
        ...state,
        noteItems: action.noteItems,
        notesForPageFetchState: {
          loading: false,
          loaded: true,
        },
      };
    case NotesListActionTypes.ErrorForPage:
      return {
        ...state,
        notesForPageFetchState: {
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };

    case NotesListActionTypes.RequestForMeal:
      return {
        ...state,
        notesForMealFetchStates: [
          ...state.notesForMealFetchStates.filter(fs => fs.mealType !== action.mealType),
          {
            mealType: action.mealType,
            loading: true,
            loaded: false,
            loadingMessage: action.loadingMessage,
          },
        ],
      };
    case NotesListActionTypes.SuccessForMeal:
      return {
        ...state,
        noteItems: [
          // Sorting meals by type for correct display
          ...state.noteItems.filter(n => n.mealType < action.mealType),
          ...action.noteItems,
          ...state.noteItems.filter(n => n.mealType > action.mealType),
        ],
        notesForMealFetchStates: [
          ...state.notesForMealFetchStates.filter(fs => fs.mealType !== action.mealType),
          {
            mealType: action.mealType,
            loading: false,
            loaded: true,
          },
        ],
      };
    case NotesListActionTypes.ErrorForMeal:
      return {
        ...state,
        notesForMealFetchStates: [
          ...state.notesForMealFetchStates.filter(fs => fs.mealType !== action.mealType),
          {
            mealType: action.mealType,
            loading: false,
            loaded: false,
            error: action.errorMessage,
          },
        ],
      };
    default:
      return state;
  }
};

export default notesListReducer;
