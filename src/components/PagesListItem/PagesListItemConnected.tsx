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
import { PageCreateEdit, PagesFilter, PageItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  editablePagesIds: number[];
}

export interface DispatchToPropsMapResult {
  createPage: (page: PageCreateEdit) => Promise<CreatePageSuccessAction | CreatePageErrorAction>;
  deleteDraftPage: (draftPageId: number) => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    editablePagesIds: state.pages.list.editablePagesIds,
  };
};

type PagesListItemDispatchType = ThunkDispatch<void, PageCreateEdit, AnyAction> &
  Dispatch<DeleteDraftPageAction> &
  ThunkDispatch<PageItem[], PagesFilter, AnyAction>;

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
