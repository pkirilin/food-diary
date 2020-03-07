import { PagesListState } from '../../store';
import { PagesListActionTypes, PagesListActions } from '../../action-types';

const initialState: PagesListState = {
  pageItems: [],
  pageItemsFetchState: {
    loading: false,
    loaded: false,
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
        pageItemsFetchState: {
          ...state.pageItemsFetchState,
          loading: true,
          loaded: false,
        },
      };
    case PagesListActionTypes.Success:
      return {
        ...state,
        pageItems: [
          // Keeping draft pages
          ...state.pageItems.filter(p => p.id < 1),
          ...action.pages,
        ],
        pageItemsFetchState: {
          ...state.pageItemsFetchState,
          loading: false,
          loaded: true,
        },
        selectedPagesIds: [],
      };
    case PagesListActionTypes.Error:
      return {
        ...state,
        pageItemsFetchState: {
          ...state.pageItemsFetchState,
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };
    case PagesListActionTypes.CreateDraftPage:
      return {
        ...state,
        pageItems: [{ ...action.draftPage, id: state.currentDraftPageId }, ...state.pageItems],
        pageItemsFetchState: {
          ...state.pageItemsFetchState,
        },
        editablePagesIds: [...state.editablePagesIds, state.currentDraftPageId],
        currentDraftPageId: state.currentDraftPageId - 1,
      };
    case PagesListActionTypes.DeleteDraftPage:
      return {
        ...state,
        pageItems: [...state.pageItems.filter(p => p.id !== action.draftPageId)],
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
        selectedPagesIds: action.selected ? state.pageItems.map(p => p.id) : [],
      };
    case PagesListActionTypes.SetEditable:
      return {
        ...state,
        editablePagesIds: action.editable
          ? [...state.editablePagesIds, ...action.pagesIds]
          : [...state.editablePagesIds.filter(sId => !action.pagesIds.some(aId => aId === sId))],
        selectedPagesIds: [],
      };
    default:
      return state;
  }
};

export default pagesListReducer;
