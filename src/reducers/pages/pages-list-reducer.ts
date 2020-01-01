import { PagesListState } from '../../store';
import { PagesListActionType, PagesListActions } from '../../action-types';

const initialState: PagesListState = {
  loading: false,
  loaded: false,
  visiblePages: [],
};

const pagesListReducer = (state: PagesListState = initialState, action: PagesListActions): PagesListState => {
  switch (action.type) {
    case PagesListActionType.Request:
      return {
        loading: true,
        loaded: false,
        visiblePages: [...state.visiblePages],
      };
    case PagesListActionType.Success:
      return {
        loading: false,
        loaded: true,
        visiblePages: action.pages,
      };
    case PagesListActionType.Error:
      return {
        loading: false,
        loaded: false,
        errorMessage: action.errorMessage,
        visiblePages: [...state.visiblePages],
      };

    default:
      return {
        loading: false,
        loaded: false,
        visiblePages: [...state.visiblePages],
      };
  }
};

export default pagesListReducer;
