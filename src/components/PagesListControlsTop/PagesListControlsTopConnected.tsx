import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch, AnyAction } from 'redux';
import {
  PagesListActions,
  ClearPagesFilterAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
} from '../../action-types';
import { PageItemState, FoodDiaryState } from '../../store';
import { createDraftPageActionCreator, clearFilterActionCreator, getPagesActionCreator } from '../../action-creators';
import { PagesFilter } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  pagesFilterChanged: boolean;
}

export interface DispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItemState) => void;
  clearPagesFilter: () => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    pagesFilterChanged: state.pages.filter.filterChanged,
  };
};

type PagesListControlsTopDispatch = Dispatch<PagesListActions> &
  Dispatch<ClearPagesFilterAction> &
  ThunkDispatch<PageItemState[], PagesFilter, AnyAction>;

const mapDispatchToProps = (dispatch: PagesListControlsTopDispatch): DispatchToPropsMapResult => {
  return {
    createDraftPage: (draftPage: PageItemState): void => {
      dispatch(createDraftPageActionCreator(draftPage));
    },
    clearPagesFilter: (): void => {
      dispatch(clearFilterActionCreator());
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPagesActionCreator(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
