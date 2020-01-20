import { PagesListState } from '../../store';
import { PagesListActionType, PagesListActions } from '../../action-types';

const initialState: PagesListState = {
  loading: false,
  loaded: false,
  visiblePages: [],
  currentDraftPageId: 0,
};

const pagesListReducer = (state: PagesListState = initialState, action: PagesListActions): PagesListState => {
  switch (action.type) {
    case PagesListActionType.Request:
      return {
        ...state,
        loading: true,
        loaded: false,
        visiblePages: [...state.visiblePages],
      };
    case PagesListActionType.Success:
      return {
        ...state,
        loading: false,
        loaded: true,
        visiblePages: action.pages,
      };
    case PagesListActionType.Error:
      return {
        ...state,
        loading: false,
        loaded: false,
        errorMessage: action.errorMessage,
        visiblePages: [...state.visiblePages],
      };
    case PagesListActionType.CreateDraftPage:
      return {
        ...state,
        visiblePages: [{ ...action.draftPage, id: state.currentDraftPageId }, ...state.visiblePages],
        currentDraftPageId: state.currentDraftPageId - 1,
      };
    default:
      return state;
  }
};

export default pagesListReducer;
