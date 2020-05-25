import { connect } from 'react-redux';
import PageCreateForm from './PageCreateForm';
import { Dispatch } from 'redux';
import {
  CloseModalAction,
  CreatePageDispatchProp,
  CreatePageDispatch,
  GetDateForNewPageDispatchProp,
  GetDateForNewPageDispatch,
  GetPagesListDispatchProp,
  GetPagesListDispatch,
} from '../../action-types';
import { closeModal, createPage, getDateForNewPage, getPages } from '../../action-creators';
import { PageCreateEdit, PagesFilter } from '../../models';
import { RootState, DataOperationState } from '../../store';

type PageCreateFormDispatch = GetDateForNewPageDispatch &
  CreatePageDispatch &
  GetPagesListDispatch &
  Dispatch<CloseModalAction>;

export interface PageCreateFormStateToPropsMapResult {
  pageOperationStatus: DataOperationState;
  pagesFilter: PagesFilter;
}

export interface PageCreateFormDispatchToPropsMapResult {
  closeModal: () => void;
  getDateForNewPage: GetDateForNewPageDispatchProp;
  createPage: CreatePageDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: RootState): PageCreateFormStateToPropsMapResult => {
  return {
    pageOperationStatus: state.pages.operations.status,
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: PageCreateFormDispatch): PageCreateFormDispatchToPropsMapResult => {
  const getDateForNewPageProp: GetDateForNewPageDispatchProp = () => {
    return dispatch(getDateForNewPage());
  };

  const createPageProp: CreatePageDispatchProp = (page: PageCreateEdit) => {
    return dispatch(createPage(page));
  };

  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },

    getDateForNewPage: getDateForNewPageProp,
    createPage: createPageProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCreateForm);
