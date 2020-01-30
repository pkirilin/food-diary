import { NotesListState } from '../../store';
import { NotesListActions, NotesListActionTypes } from '../../action-types/notes';

const initialState: NotesListState = {
  notesForPage: {
    loading: false,
    loaded: false,
    data: null,
  },
};

const notesListReducer = (state: NotesListState = initialState, action: NotesListActions): NotesListState => {
  switch (action.type) {
    case NotesListActionTypes.Request:
      return {
        ...state,
        notesForPage: {
          ...state.notesForPage,
          loading: true,
          loaded: false,
        },
      };
    case NotesListActionTypes.Success:
      return {
        ...state,
        notesForPage: {
          ...state.notesForPage,
          loading: false,
          loaded: true,
          data: action.notes,
        },
      };
    case NotesListActionTypes.Error:
      return {
        ...state,
        notesForPage: {
          ...state.notesForPage,
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
