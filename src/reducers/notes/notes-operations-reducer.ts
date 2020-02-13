import { NotesOperationsState } from '../../store';
import { NotesOperationsActions, NotesOperationsActionTypes } from '../../action-types';

const initialState: NotesOperationsState = {
  status: {
    performing: false,
  },
};

const notesOperationsReducer = (
  state: NotesOperationsState = initialState,
  action: NotesOperationsActions,
): NotesOperationsState => {
  switch (action.type) {
    case NotesOperationsActionTypes.CreateRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.operationMessage,
        },
      };
    case NotesOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case NotesOperationsActionTypes.CreateError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
};

export default notesOperationsReducer;
