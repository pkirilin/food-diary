import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch, AnyAction } from 'redux';
import {
  DeleteDraftPageAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  CreatePageSuccessAction,
  CreatePageErrorAction,
} from '../../action-types';
import { deleteDraftPageActionCreator, createPageActionCreator, getPagesActionCreator } from '../../action-creators';
import { PageCreateEdit, PagesFilter } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { PageItemState, FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
}

export interface DispatchToPropsMapResult {
  createPage: (page: PageCreateEdit) => Promise<CreatePageSuccessAction | CreatePageErrorAction>;
  deleteDraftPage: (draftPageId: number) => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
  };
};

type PagesListItemDispatchType = ThunkDispatch<void, PageCreateEdit, AnyAction> &
  Dispatch<DeleteDraftPageAction> &
  ThunkDispatch<PageItemState[], PagesFilter, AnyAction>;

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): DispatchToPropsMapResult => {
  return {
    createPage: (page: PageCreateEdit): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
      return dispatch(createPageActionCreator(page));
    },
    deleteDraftPage: (draftPageId: number): void => {
      dispatch(deleteDraftPageActionCreator(draftPageId));
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPagesActionCreator(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
