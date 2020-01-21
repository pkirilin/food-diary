import { PagesListState } from '../../store';
import { PagesListActionType, PagesListActions } from '../../action-types';

const initialState: PagesListState = {
  loading: false,
  loaded: false,
  visiblePages: [],
  currentDraftPageId: 0,
  editablePagesIds: [],
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
        visiblePages: [
          // Keeping pages that marked as editable
          ...state.visiblePages.filter(p => state.editablePagesIds.some(id => p.id === id)),
          ...action.pages,
        ],
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
        editablePagesIds: [...state.editablePagesIds, state.currentDraftPageId],
        currentDraftPageId: state.currentDraftPageId - 1,
      };
    case PagesListActionType.DeleteDraftPage:
      return {
        ...state,
        visiblePages: state.visiblePages.filter(p => p.id !== action.draftPageId),
        editablePagesIds: state.editablePagesIds.filter(id => id !== action.draftPageId),
      };
    default:
      return state;
  }
};

export default pagesListReducer;
