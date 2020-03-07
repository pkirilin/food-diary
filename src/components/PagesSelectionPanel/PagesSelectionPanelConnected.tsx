import { connect } from 'react-redux';
import PagesSelectionPanel from './PagesSelectionPanel';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import {
  SetSelectedForAllPagesAction,
  DeletePagesSuccessAction,
  DeletePagesErrorAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  SetEditableForPagesAction,
} from '../../action-types';
import { setSelectedForAllPages, deletePages, getPages, setEditableForPages } from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import { PagesFilter, PageItem } from '../../models';

export interface StateToPropsMapResult {
  visiblePagesIds: number[];
  selectedPagesIds: number[];
  operationMessage?: string;
  pagesFilter: PagesFilter;
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
  areNotesForPageFetching: boolean;
  areNotesForMealFetching: boolean;
}

export interface DispatchToPropsMapResult {
  setSelectedForAllPages: (selected: boolean) => void;
  deletePages: (pagesIds: number[]) => Promise<DeletePagesSuccessAction | DeletePagesErrorAction>;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
  setEditableForPages: (pagesIds: number[], editable: boolean) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    visiblePagesIds: state.pages.list.pageItems.map(p => p.id),
    selectedPagesIds: state.pages.list.selectedPagesIds,
    operationMessage: state.pages.operations.status.message,
    pagesFilter: state.pages.filter,
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
    areNotesForPageFetching: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealFetching: state.notes.list.notesForMealFetchStates.some(s => s.loading),
  };
};

type PagesSelectionPanelConnectedDispatch = Dispatch<SetSelectedForAllPagesAction | SetEditableForPagesAction> &
  ThunkDispatch<void, number[], DeletePagesSuccessAction | DeletePagesErrorAction> &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: PagesSelectionPanelConnectedDispatch): DispatchToPropsMapResult => {
  return {
    setSelectedForAllPages: (selected: boolean): void => {
      dispatch(setSelectedForAllPages(selected));
    },
    deletePages: (pagesIds: number[]): Promise<DeletePagesSuccessAction | DeletePagesErrorAction> => {
      return dispatch(deletePages(pagesIds));
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
    setEditableForPages: (pagesIds: number[], editable: boolean): void => {
      dispatch(setEditableForPages(pagesIds, editable));
    },
  };
};

const PagesSelectionPanelConnected = connect(mapStateToProps, mapDispatchToProps)(PagesSelectionPanel);

export default PagesSelectionPanelConnected;
