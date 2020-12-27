import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import {
  ClearPagesFilterAction,
  GetPagesListDispatch,
  GetNotesForPageDispatch,
  GetPagesListDispatchProp,
  GetNotesForPageDispatchProp,
  OpenModalAction,
  ImportPagesDispatchProp,
  ImportPagesDispatch,
  GetDateForNewPageDispatch,
} from '../../action-types';
import { RootState, ModalBody, ModalOptions } from '../../store';
import {
  clearFilter,
  getPages,
  getNotesForPage,
  openModal,
  importPages,
  openConfirmationModal,
  openMessageModal,
} from '../../action-creators';
import { PagesFilter, NotesSearchRequest } from '../../models';

type PagesListControlsTopDispatch = Dispatch<ClearPagesFilterAction | OpenModalAction> &
  GetPagesListDispatch &
  GetNotesForPageDispatch &
  ImportPagesDispatch &
  GetDateForNewPageDispatch;

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
  clearPagesFilter: () => void;
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
  openMessageModal: (title: string, message: string) => void;
  openConfirmationModal: (title: string, message: string, confirm: () => void) => void;
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
    clearPagesFilter: (): void => {
      dispatch(clearFilter());
    },

    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },

    openMessageModal: (title: string, message: string): void => {
      dispatch(openMessageModal(title, message));
    },

    openConfirmationModal: (title: string, message: string, confirm: () => void): void => {
      dispatch(openConfirmationModal(title, message, confirm));
    },

    getPages: getPagesProp,
    getNotesForPage: getNotesForPageProp,
    importPages: importPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
