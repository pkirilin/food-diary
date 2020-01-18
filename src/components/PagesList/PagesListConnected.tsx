import { connect } from 'react-redux';
import PagesList from './PagesList';
import { ThunkDispatch } from 'redux-thunk';
import { PageItem, PagesFilter } from '../../models';
import { AnyAction } from 'redux';
import { getPagesActionCreator } from '../../action-creators';
import { FoodDiaryState, PagesListState } from '../../store';
import { GetPagesListSuccessAction, GetPagesListErrorAction } from '../../action-types';

export interface StateToPropsMapResult extends PagesListState {
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    visiblePages: state.pages.list.visiblePages ?? [],
    loaded: state.pages.list.loaded ?? false,
    loading: state.pages.list.loading ?? false,
    errorMessage: state.pages.list.errorMessage,
    pagesFilter: state.pages.filter,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<PageItem[], PagesFilter, AnyAction>): DispatchToPropsMapResult => {
  return {
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> =>
      dispatch(getPagesActionCreator(filter)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesList);
