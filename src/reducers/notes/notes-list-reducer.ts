import { NotesListState } from '../../store';
import { NotesListActions, NotesListActionTypes } from '../../action-types/notes';

const initialState: NotesListState = {
  notesForPage: null,
  notesForPageFetchState: {
    loading: false,
    loaded: false,
  },
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
        notesForPage: action.notesForPage,
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

    default:
      return state;
  }
};

export default notesListReducer;
