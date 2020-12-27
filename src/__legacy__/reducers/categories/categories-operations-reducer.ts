import { CategoriesOperationsState } from '../../store';
import { CategoriesOperationsActions, CategoriesOperationsActionTypes } from '../../action-types';

export const initialState: CategoriesOperationsState = {
  status: {
    performing: false,
  },
  completionStatus: 'initial',
};

const categoriesOperationsReducer = (
  state: CategoriesOperationsState = initialState,
  action: CategoriesOperationsActions,
): CategoriesOperationsState => {
  if (
    action.type === CategoriesOperationsActionTypes.CreateRequest ||
    action.type === CategoriesOperationsActionTypes.EditRequest ||
    action.type === CategoriesOperationsActionTypes.DeleteRequest
  ) {
    return {
      status: {
        performing: true,
        message: action.requestMessage,
      },
      completionStatus: 'idle',
    };
  }

  if (
    action.type === CategoriesOperationsActionTypes.CreateError ||
    action.type === CategoriesOperationsActionTypes.EditError ||
    action.type === CategoriesOperationsActionTypes.DeleteError
  ) {
    return {
      status: {
        performing: false,
        error: action.errorMessage,
      },
      completionStatus: 'idle',
    };
  }

  type SuccessStateWithoutCompletionStatus = Omit<CategoriesOperationsState, 'completionStatus'>;

  const successStatePreview: SuccessStateWithoutCompletionStatus = {
    status: { performing: false },
  };

  switch (action.type) {
    case CategoriesOperationsActionTypes.CreateSuccess:
      return {
        ...successStatePreview,
        completionStatus: 'created',
      };
    case CategoriesOperationsActionTypes.EditSuccess:
      return {
        ...successStatePreview,
        completionStatus: 'updated',
      };
    case CategoriesOperationsActionTypes.DeleteSuccess:
      return {
        ...successStatePreview,
        completionStatus: 'deleted',
      };
    default:
      return state;
  }
};

export default categoriesOperationsReducer;
