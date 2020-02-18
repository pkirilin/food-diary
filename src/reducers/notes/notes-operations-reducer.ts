import { NotesOperationsState, MealOperationStatus } from '../../store';
import { NotesOperationsActions, NotesOperationsActionTypes } from '../../action-types';
import { availableMealTypes } from '../../models';

const initMealOperationStatuses = (): MealOperationStatus[] => {
  const result: MealOperationStatus[] = [];
  availableMealTypes.forEach(mealType => {
    result.push({
      mealType,
      performing: false,
    });
  });
  return result;
};

const initialState: NotesOperationsState = {
  mealOperationStatuses: initMealOperationStatuses(),
};

const notesOperationsReducer = (
  state: NotesOperationsState = initialState,
  action: NotesOperationsActions,
): NotesOperationsState => {
  switch (action.type) {
    case NotesOperationsActionTypes.CreateRequest:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.note.mealType),
          {
            mealType: action.note.mealType,
            performing: true,
            message: action.operationMessage,
          },
        ],
      };
    case NotesOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
          },
        ],
      };
    case NotesOperationsActionTypes.CreateError:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
            error: action.error,
          },
        ],
      };

    case NotesOperationsActionTypes.EditRequest:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.note.mealType),
          {
            mealType: action.note.mealType,
            performing: true,
            message: action.operationMessage,
          },
        ],
      };
    case NotesOperationsActionTypes.EditSuccess:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
          },
        ],
      };
    case NotesOperationsActionTypes.EditError:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
            error: action.error,
          },
        ],
      };

    case NotesOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: true,
            message: action.operationMessage,
          },
        ],
      };
    case NotesOperationsActionTypes.DeleteSuccess:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
          },
        ],
      };
    case NotesOperationsActionTypes.DeleteError:
      return {
        ...state,
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.mealType),
          {
            mealType: action.mealType,
            performing: false,
            error: action.error,
          },
        ],
      };
    default:
      return state;
  }
};

export default notesOperationsReducer;
