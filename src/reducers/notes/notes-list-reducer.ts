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

const initialState: NotesListState = {
  mealItemsWithNotes: [],
  notesForPageFetchState: {
    loading: false,
    loaded: false,
  },
  notesForMealFetchStates: initNotesForMealFetchStates(),
  editableNotesIds: [],
};

const notesListReducer = (state: NotesListState = initialState, action: NotesListActions): NotesListState => {
  switch (action.type) {
    case NotesListActionTypes.RequestForPage:
      return {
        ...state,
        notesForPageFetchState: {
          ...state.notesForPageFetchState,
          loading: true,
          loaded: false,
        },
      };
    case NotesListActionTypes.SuccessForPage:
      return {
        ...state,
        mealItemsWithNotes: action.mealItemsWithNotes,
        notesForPageFetchState: {
          ...state.notesForPageFetchState,
          loading: false,
          loaded: true,
        },
      };
    case NotesListActionTypes.ErrorForPage:
      return {
        ...state,
        notesForPageFetchState: {
          ...state.notesForPageFetchState,
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
          },
        ],
      };
    case NotesListActionTypes.SuccessForMeal:
      return {
        ...state,
        mealItemsWithNotes: [
          // Sorting meals by type for correct display
          ...state.mealItemsWithNotes.filter(m => m.type < action.mealItem.type),
          action.mealItem,
          ...state.mealItemsWithNotes.filter(m => m.type > action.mealItem.type),
        ],
        notesForMealFetchStates: [
          ...state.notesForMealFetchStates.filter(fs => fs.mealType !== action.mealItem.type),
          {
            mealType: action.mealItem.type,
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

    case NotesListActionTypes.SetEditable:
      return {
        ...state,
        editableNotesIds: action.editable
          ? [...state.editableNotesIds, action.noteId]
          : [...state.editableNotesIds.filter(id => id !== action.noteId)],
      };
    default:
      return state;
  }
};

export default notesListReducer;
