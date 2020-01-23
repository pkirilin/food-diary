import { connect } from 'react-redux';
import PagesList from './PagesList';
import { ThunkDispatch } from 'redux-thunk';
import { PagesFilter, PageItem } from '../../models';
import { getPages } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { GetPagesListSuccessAction, GetPagesListErrorAction } from '../../action-types';

export interface StateToPropsMapResult {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
  visiblePages: PageItem[];
  currentDraftPageId: number;
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    visiblePages: state.pages.list.pageItems.data,
    loaded: state.pages.list.pageItems.loaded,
    loading: state.pages.list.pageItems.loading,
    errorMessage: state.pages.list.pageItems.error,
    pagesFilter: state.pages.filter,
    currentDraftPageId: state.pages.list.currentDraftPageId,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>,
): DispatchToPropsMapResult => {
  return {
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesList);
