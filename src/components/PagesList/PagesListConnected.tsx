import { connect } from 'react-redux';
import PagesList from './PagesList';
import { PagesFilter, PageItem } from '../../models';
import { getPages } from '../../action-creators';
import { FoodDiaryState, DataFetchState } from '../../store';
import { GetPagesListDispatch, GetPagesListDispatchProp } from '../../action-types';

type PagesListDispatch = GetPagesListDispatch;

export interface PagesListStateToPropsMapResult {
  pageItems: PageItem[];
  pageItemsFetchState: DataFetchState;
  pageDraftItems: PageItem[];
  currentDraftPageId: number;
  pagesFilter: PagesFilter;
}

export interface PagesListDispatchToPropsMapResult {
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): PagesListStateToPropsMapResult => {
  return {
    pageItems: state.pages.list.pageItems,
    pageItemsFetchState: state.pages.list.pageItemsFetchState,
    pageDraftItems: state.pages.list.pageDraftItems,
    pagesFilter: state.pages.filter.params,
    currentDraftPageId: state.pages.list.currentDraftPageId,
  };
};

const mapDispatchToProps = (dispatch: PagesListDispatch): PagesListDispatchToPropsMapResult => {
  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesList);
