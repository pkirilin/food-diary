import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import {
  PagesListActions,
  ClearPagesFilterAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
} from '../../action-types';
import { FoodDiaryState } from '../../store';
import { createDraftPage, clearFilter, getPages, getNotesForPage } from '../../action-creators';
import { PagesFilter, PageItem, NotesSearchRequest, NoteItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  isPagesFilterChanged: boolean;
  arePagesLoading: boolean;
  areNotesForPageLoading: boolean;
  areNotesForMealLoading: boolean;
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
}

export interface DispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItem) => void;
  clearPagesFilter: () => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
  getNotesForPage: (request: NotesSearchRequest) => Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    isPagesFilterChanged: state.pages.filter.filterChanged,
    arePagesLoading: state.pages.list.pageItemsFetchState.loading,
    areNotesForPageLoading: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealLoading: state.notes.list.notesForMealFetchStates.some(s => s.loading),
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
  };
};

type PagesListControlsTopDispatch = Dispatch<PagesListActions> &
  Dispatch<ClearPagesFilterAction> &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction> &
  ThunkDispatch<NoteItem[], NotesSearchRequest, GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;

const mapDispatchToProps = (dispatch: PagesListControlsTopDispatch): DispatchToPropsMapResult => {
  return {
    createDraftPage: (draftPage: PageItem): void => {
      dispatch(createDraftPage(draftPage));
    },
    clearPagesFilter: (): void => {
      dispatch(clearFilter());
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
    getNotesForPage: (
      request: NotesSearchRequest,
    ): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
      return dispatch(getNotesForPage(request));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
