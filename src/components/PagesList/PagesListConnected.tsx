import { connect } from 'react-redux';
import PagesList from './PagesList';
import { ThunkDispatch } from 'redux-thunk';
import { PageItem } from '../../models';
import { AnyAction } from 'redux';
import { getPagesActionCreator } from '../../action-creators';
import { FoodDiaryState, PagesListState } from '../../store';
import { GetPagesListSuccessAction } from '../../action-types';

export type StateToPropsMapResult = PagesListState;

export interface DispatchToPropsMapResult {
  getPages: () => Promise<GetPagesListSuccessAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    visiblePages: state.pages.list.visiblePages ?? [],
    loaded: state.pages.list.loaded ?? false,
    loading: state.pages.list.loading ?? false,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<PageItem[], null, AnyAction>): DispatchToPropsMapResult => {
  return {
    getPages: (): Promise<GetPagesListSuccessAction> => dispatch(getPagesActionCreator()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesList);
