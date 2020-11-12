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
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.payload.mealType),
          {
            mealType: action.payload.mealType,
            performing: true,
            message: action.requestMessage,
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
            error: action.errorMessage,
          },
        ],
      };

    case NotesOperationsActionTypes.EditRequest:
      return {
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.payload.note.mealType),
          {
            mealType: action.payload.note.mealType,
            performing: true,
            message: action.requestMessage,
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
            error: action.errorMessage,
          },
        ],
      };

    case NotesOperationsActionTypes.DeleteRequest:
      return {
        mealOperationStatuses: [
          ...state.mealOperationStatuses.filter(s => s.mealType !== action.payload.mealType),
          {
            mealType: action.payload.mealType,
            performing: true,
            message: action.requestMessage,
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
            error: action.errorMessage,
          },
        ],
      };
    default:
      return state;
  }
};

export default notesOperationsReducer;
