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
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.request.note.mealType),
          {
            mealType: action.request.note.mealType,
            performing: true,
            message: action.operationMessage,
          },
        ],
      };
    case NotesOperationsActionTypes.EditSuccess:
      return {
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
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.request.mealType),
          {
            mealType: action.request.mealType,
            performing: true,
            message: action.operationMessage,
          },
        ],
      };
    case NotesOperationsActionTypes.DeleteSuccess:
      return {
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
