import { connect } from 'react-redux';
import PagesListItemEditable from './PagesListItemEditable';
import { PagesFilter, PageCreateEdit, PageEditRequest, PageItem } from '../../models';
import {
  CreatePageSuccessAction,
  CreatePageErrorAction,
  EditPageSuccessAction,
  EditPageErrorAction,
  GetPagesListSuccessAction,
  GetPagesListErrorAction,
  DeleteDraftPageAction,
  SetSelectedForPageAction,
  SetEditableForPagesAction,
} from '../../action-types';
import { deleteDraftPage, createPage, getPages, setEditableForPages, editPage } from '../../action-creators';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  FoodDiaryState,
  DataOperationState,
  MealOperationStatus,
  DataFetchState,
  NotesForMealFetchState,
} from '../../store';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  pageOperationStatus: DataOperationState;
  mealOperationStatuses: MealOperationStatus[];
  notesForPageFetchState: DataFetchState;
  notesForMealFetchStates: NotesForMealFetchState[];
}

export interface DispatchToPropsMapResult {
  createPage: (page: PageCreateEdit) => Promise<CreatePageSuccessAction | CreatePageErrorAction>;
  editPage: (request: PageEditRequest) => Promise<EditPageSuccessAction | EditPageErrorAction>;
  deleteDraftPage: (draftPageId: number) => void;
  getPages: (filter: PagesFilter) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
  setEditableForPages: (pagesIds: number[], editable: boolean) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    pageOperationStatus: state.pages.operations.status,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
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
    setEditableForPages: (pagesIds: number[], editable: boolean): void => {
      dispatch(setEditableForPages(pagesIds, editable));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItemEditable);
