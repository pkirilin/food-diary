import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import {
  ClearPagesFilterAction,
  GetPagesListDispatch,
  GetNotesForPageDispatch,
  CreateDraftPageAction,
  GetPagesListDispatchProp,
  GetNotesForPageDispatchProp,
  OpenModalAction,
  ImportPagesDispatchProp,
  ImportPagesDispatch,
} from '../../action-types';
import { RootState, ModalBody, ModalOptions } from '../../store';
import { createDraftPage, clearFilter, getPages, getNotesForPage, openModal, importPages } from '../../action-creators';
import { PagesFilter, PageItem, NotesSearchRequest } from '../../models';

type PagesListControlsTopDispatch = Dispatch<CreateDraftPageAction | ClearPagesFilterAction | OpenModalAction> &
  GetPagesListDispatch &
  GetNotesForPageDispatch &
  ImportPagesDispatch;

export interface PagesListControlsTopStateToPropsMapResult {
  pagesFilter: PagesFilter;
  isPagesFilterChanged: boolean;
  arePagesLoading: boolean;
  areNotesForPageLoading: boolean;
  areNotesForMealLoading: boolean;
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
}

export interface PagesListControlsTopDispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItem) => void;
  clearPagesFilter: () => void;
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
  getPages: GetPagesListDispatchProp;
  getNotesForPage: GetNotesForPageDispatchProp;
  importPages: ImportPagesDispatchProp;
}

const mapStateToProps = (state: RootState): PagesListControlsTopStateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter.params,
    isPagesFilterChanged: state.pages.filter.isChanged,
    arePagesLoading: state.pages.list.pageItemsFetchState.loading,
    areNotesForPageLoading: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealLoading: state.notes.list.notesForMealFetchStates.some(s => s.loading),
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
  };
};

const mapDispatchToProps = (dispatch: PagesListControlsTopDispatch): PagesListControlsTopDispatchToPropsMapResult => {
  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  const getNotesForPageProp: GetNotesForPageDispatchProp = (request: NotesSearchRequest) => {
    return dispatch(getNotesForPage(request));
  };

  const importPagesProp: ImportPagesDispatchProp = (importFile: File) => {
    return dispatch(importPages(importFile));
  };

  return {
    createDraftPage: (draftPage: PageItem): void => {
      dispatch(createDraftPage(draftPage));
    },

    clearPagesFilter: (): void => {
      dispatch(clearFilter());
    },

    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },

    getPages: getPagesProp,
    getNotesForPage: getNotesForPageProp,
    importPages: importPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
