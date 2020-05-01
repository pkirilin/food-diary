import { connect } from 'react-redux';
import PagesList from './PagesList';
import { ThunkDispatch } from 'redux-thunk';
import { PagesFilter, PageItem } from '../../models';
import { getPages } from '../../action-creators';
import { FoodDiaryState, DataFetchState } from '../../store';
import { GetPagesListSuccessAction, GetPagesListErrorAction } from '../../action-types';

export interface StateToPropsMapResult {
  pageItems: PageItem[];
  pageItemsFetchState: DataFetchState;
  pageDraftItems: PageItem[];
  currentDraftPageId: number;
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageItems: state.pages.list.pageItems,
    pageItemsFetchState: state.pages.list.pageItemsFetchState,
    pageDraftItems: state.pages.list.pageDraftItems,
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
