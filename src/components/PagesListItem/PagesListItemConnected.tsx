import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch } from 'redux';
import {
  DeleteDraftPageAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  CreatePageSuccessAction,
  CreatePageErrorAction,
} from '../../action-types';
import { deleteDraftPage, createPage, getPages } from '../../action-creators';
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

type PagesListItemDispatchType = ThunkDispatch<void, PageCreateEdit, CreatePageSuccessAction | CreatePageErrorAction> &
  Dispatch<DeleteDraftPageAction> &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): DispatchToPropsMapResult => {
  return {
    createPage: (page: PageCreateEdit): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
      return dispatch(createPage(page));
    },
    deleteDraftPage: (draftPageId: number): void => {
      dispatch(deleteDraftPage(draftPageId));
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
