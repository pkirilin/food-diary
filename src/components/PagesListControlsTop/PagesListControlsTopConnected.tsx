import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import { PagesListActions, ClearPagesFilterAction } from '../../action-types';
import { PageItemState, FoodDiaryState } from '../../store';
import { createDraftPageActionCreator, clearFilterActionCreator } from '../../action-creators';

export interface StateToPropsMapResult {
  pagesFilterChanged: boolean;
}

export interface DispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItemState) => void;
  clearPagesFilter: () => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilterChanged: state.pages.filter.filterChanged,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch<PagesListActions> & Dispatch<ClearPagesFilterAction>,
): DispatchToPropsMapResult => {
  return {
    createDraftPage: (draftPage: PageItemState): void => {
      dispatch(createDraftPageActionCreator(draftPage));
    },
    clearPagesFilter: (): void => {
      dispatch(clearFilterActionCreator());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
