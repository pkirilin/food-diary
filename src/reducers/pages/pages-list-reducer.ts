import { PagesListState } from '../../store';
import { PagesListActionTypes, PagesListActions } from '../../action-types';

const initialState: PagesListState = {
  pageItems: {
    loading: false,
    loaded: false,
    data: [],
  },
  currentDraftPageId: 0,
  editablePagesIds: [],
  selectedPagesIds: [],
};

const pagesListReducer = (state: PagesListState = initialState, action: PagesListActions): PagesListState => {
  switch (action.type) {
    case PagesListActionTypes.Request:
      return {
        ...state,
        pageItems: {
          ...state.pageItems,
          loading: true,
          loaded: false,
        },
      };
    case PagesListActionTypes.Success:
      return {
        ...state,
        pageItems: {
          ...state.pageItems,
          loading: false,
          loaded: true,
          data: [
            // Keeping pages that marked as editable
            ...state.pageItems.data.filter(p => state.editablePagesIds.some(id => p.id === id)),
            ...action.pages,
          ],
        },
        selectedPagesIds: [],
      };
    case PagesListActionTypes.Error:
      return {
        ...state,
        pageItems: {
          ...state.pageItems,
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };
    case PagesListActionTypes.CreateDraftPage:
      return {
        ...state,
        pageItems: {
          ...state.pageItems,
          data: [{ ...action.draftPage, id: state.currentDraftPageId }, ...state.pageItems.data],
        },
        editablePagesIds: [...state.editablePagesIds, state.currentDraftPageId],
        currentDraftPageId: state.currentDraftPageId - 1,
      };
    case PagesListActionTypes.DeleteDraftPage:
      return {
        ...state,
        pageItems: {
          ...state.pageItems,
          data: state.pageItems.data.filter(p => p.id !== action.draftPageId),
        },
        editablePagesIds: state.editablePagesIds.filter(id => id !== action.draftPageId),
      };
    case PagesListActionTypes.SetSelected:
      return {
        ...state,
        selectedPagesIds: action.selected
          ? [...state.selectedPagesIds, action.pageId]
          : [...state.selectedPagesIds.filter(id => id !== action.pageId)],
      };
    case PagesListActionTypes.SetSelectedAll:
      return {
        ...state,
        selectedPagesIds: action.selected ? state.pageItems.data.map(p => p.id) : [],
      };
    default:
      return state;
  }
};

export default pagesListReducer;
