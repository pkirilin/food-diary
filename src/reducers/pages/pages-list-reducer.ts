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
      };
    case PagesListActionType.Success:
      return {
        ...state,
        loading: false,
        loaded: true,
        visiblePages: [...state.visiblePages.filter(p => p.editable), ...action.pages],
      };
    case PagesListActionType.Error:
      return {
        ...state,
        loading: false,
        loaded: false,
        errorMessage: action.errorMessage,
      };
    case PagesListActionType.CreateDraftPage:
      return {
        ...state,
        visiblePages: [{ ...action.draftPage, id: state.currentDraftPageId }, ...state.visiblePages],
        currentDraftPageId: state.currentDraftPageId - 1,
      };
    case PagesListActionType.DeleteDraftPage:
      return { ...state, visiblePages: state.visiblePages.filter(p => p.id !== action.draftPageId) };
    default:
      return state;
  }
};

export default pagesListReducer;
