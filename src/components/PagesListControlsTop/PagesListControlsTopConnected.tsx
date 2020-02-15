import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import {
  PagesListActions,
  ClearPagesFilterAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
} from '../../action-types';
import { FoodDiaryState } from '../../store';
import { createDraftPage, clearFilter, getPages } from '../../action-creators';
import { PagesFilter, PageItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  pagesFilterChanged: boolean;
  pagesLoading: boolean;
  pagesLoaded: boolean;
}

export interface DispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItem) => void;
  clearPagesFilter: () => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    pagesFilterChanged: state.pages.filter.filterChanged,
    pagesLoading: state.pages.list.pageItemsFetchState.loading,
    pagesLoaded: state.pages.list.pageItemsFetchState.loaded,
  };
};

type PagesListControlsTopDispatch = Dispatch<PagesListActions> &
  Dispatch<ClearPagesFilterAction> &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: PagesListControlsTopDispatch): DispatchToPropsMapResult => {
  return {
    createDraftPage: (draftPage: PageItem): void => {
      dispatch(createDraftPage(draftPage));
    },
    clearPagesFilter: (): void => {
      dispatch(clearFilter());
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
