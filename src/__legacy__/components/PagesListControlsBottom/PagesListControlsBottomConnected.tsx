import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { Dispatch } from 'redux';
import { updateFilter } from '../../action-creators';
import { RootState } from '../../store';
import { PagesFilter } from '../../models';
import { UpdatePagesFilterAction } from '../../action-types';

type PagesListControlsBottomDispatch = Dispatch<UpdatePagesFilterAction>;

export interface PagesListControlsBottomStateToPropsMapResult {
  pagesFilter: PagesFilter;
  arePagesLoading: boolean;
  areNotesForPageLoading: boolean;
  areNotesForMealLoading: boolean;
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
}

export interface PagesListControlsBottomDispatchToPropsMapResult {
  updatePagesFilter: (updatedFilter: PagesFilter) => void;
}

const mapStateToProps = (state: RootState): PagesListControlsBottomStateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter.params,
    arePagesLoading: state.pages.list.pageItemsFetchState.loading,
    areNotesForPageLoading: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealLoading: state.notes.list.notesForMealFetchStates.some(s => s.loading),
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
  };
};

const mapDispatchToProps = (
  dispatch: PagesListControlsBottomDispatch,
): PagesListControlsBottomDispatchToPropsMapResult => {
  return {
    updatePagesFilter: (updatedFilter: PagesFilter): void => {
      dispatch(updateFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
