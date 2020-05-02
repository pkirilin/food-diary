import { connect } from 'react-redux';
import PagesSelectionPanel from './PagesSelectionPanel';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import {
  SetSelectedForAllPagesAction,
  SetEditableForPagesAction,
  DeletePagesDispatch,
  GetPagesListDispatch,
  DeletePagesDispatchProp,
  GetPagesListDispatchProp,
} from '../../action-types';
import { setSelectedForAllPages, deletePages, getPages, setEditableForPages } from '../../action-creators';
import { PagesFilter } from '../../models';

type PagesSelectionPanelConnectedDispatch = Dispatch<SetSelectedForAllPagesAction | SetEditableForPagesAction> &
  DeletePagesDispatch &
  GetPagesListDispatch;

export interface PagesSelectionPanelStateToPropsMapResult {
  visiblePagesIds: number[];
  selectedPagesIds: number[];
  operationMessage?: string;
  pagesFilter: PagesFilter;
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
  areNotesForPageFetching: boolean;
  areNotesForMealFetching: boolean;
}

export interface PagesSelectionPanelDispatchToPropsMapResult {
  setSelectedForAllPages: (selected: boolean) => void;
  setEditableForPages: (pagesIds: number[], editable: boolean) => void;
  deletePages: DeletePagesDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): PagesSelectionPanelStateToPropsMapResult => {
  return {
    visiblePagesIds: state.pages.list.pageItems.map(p => p.id),
    selectedPagesIds: state.pages.list.selectedPagesIds,
    operationMessage: state.pages.operations.status.message,
    pagesFilter: state.pages.filter.params,
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
    areNotesForPageFetching: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealFetching: state.notes.list.notesForMealFetchStates.some(s => s.loading),
  };
};

const mapDispatchToProps = (
  dispatch: PagesSelectionPanelConnectedDispatch,
): PagesSelectionPanelDispatchToPropsMapResult => {
  const deletePagesProp: DeletePagesDispatchProp = (pagesIds: number[]) => {
    return dispatch(deletePages(pagesIds));
  };

  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    setSelectedForAllPages: (selected: boolean): void => {
      dispatch(setSelectedForAllPages(selected));
    },

    setEditableForPages: (pagesIds: number[], editable: boolean): void => {
      dispatch(setEditableForPages(pagesIds, editable));
    },

    deletePages: deletePagesProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesSelectionPanel);
