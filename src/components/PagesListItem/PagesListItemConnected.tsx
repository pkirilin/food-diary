import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch } from 'redux';
import {
  DeleteDraftPageAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  CreatePageSuccessAction,
  CreatePageErrorAction,
  SetSelectedForPageAction,
  SetEditableForPagesAction,
  EditPageSuccessAction,
  EditPageErrorAction,
} from '../../action-types';
import {
  deleteDraftPage,
  createPage,
  getPages,
  setSelectedForPage,
  setEditableForPages,
  editPage,
} from '../../action-creators';
import { PageCreateEdit, PagesFilter, PageItem, PageEditRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  editablePagesIds: number[];
  selectedPagesIds: number[];
  isPageOperationInProcess: boolean;
  isNoteOperationInProcess: boolean;
  areNotesForPageLoading: boolean;
  areNotesForMealLoading: boolean;
}

export interface DispatchToPropsMapResult {
  createPage: (page: PageCreateEdit) => Promise<CreatePageSuccessAction | CreatePageErrorAction>;
  editPage: (request: PageEditRequest) => Promise<EditPageSuccessAction | EditPageErrorAction>;
  deleteDraftPage: (draftPageId: number) => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
  setSelectedForPage: (selected: boolean, pageId: number) => void;
  setEditableForPages: (pagesIds: number[], editable: boolean) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    editablePagesIds: state.pages.list.editablePagesIds,
    selectedPagesIds: state.pages.list.selectedPagesIds,
    isPageOperationInProcess: state.pages.operations.status.performing,
    isNoteOperationInProcess: state.notes.operations.mealOperationStatuses.some(s => s.performing),
    areNotesForPageLoading: state.notes.list.notesForPageFetchState.loading,
    areNotesForMealLoading: state.notes.list.notesForMealFetchStates.some(s => s.loading),
  };
};

type PagesListItemDispatchType = Dispatch<
  DeleteDraftPageAction | SetSelectedForPageAction | SetEditableForPagesAction
> &
  ThunkDispatch<void, PageCreateEdit, CreatePageSuccessAction | CreatePageErrorAction> &
  ThunkDispatch<void, PageEditRequest, EditPageSuccessAction | EditPageErrorAction> &
  ThunkDispatch<PageItem[], PagesFilter, GetPagesListSuccessAction | GetPagesListErrorAction>;

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): DispatchToPropsMapResult => {
  return {
    createPage: (page: PageCreateEdit): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
      return dispatch(createPage(page));
    },
    editPage: (request: PageEditRequest): Promise<EditPageSuccessAction | EditPageErrorAction> => {
      return dispatch(editPage(request));
    },
    deleteDraftPage: (draftPageId: number): void => {
      dispatch(deleteDraftPage(draftPageId));
    },
    getPages: (filter: PagesFilter): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPages(filter));
    },
    setSelectedForPage: (selected: boolean, pageId: number): void => {
      dispatch(setSelectedForPage(selected, pageId));
    },
    setEditableForPages: (pagesIds: number[], editable: boolean): void => {
      dispatch(setEditableForPages(pagesIds, editable));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
