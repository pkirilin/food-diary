import { connect } from 'react-redux';
import PagesListItemEditable from './PagesListItemEditable';
import { PagesFilter, PageCreateEdit, PageEditRequest } from '../../models';
import {
  DeleteDraftPageAction,
  SetSelectedForPageAction,
  SetEditableForPagesAction,
  CreatePageDispatchProp,
  EditPageDispatchProp,
  GetPagesListDispatchProp,
  CreatePageDispatch,
  EditPageDispatch,
  GetPagesListDispatch,
} from '../../action-types';
import { deleteDraftPage, createPage, getPages, setEditableForPages, editPage } from '../../action-creators';
import { Dispatch } from 'redux';
import {
  FoodDiaryState,
  DataOperationState,
  MealOperationStatus,
  DataFetchState,
  NotesForMealFetchState,
} from '../../store';

type PagesListItemDispatchType = Dispatch<
  DeleteDraftPageAction | SetSelectedForPageAction | SetEditableForPagesAction
> &
  CreatePageDispatch &
  EditPageDispatch &
  GetPagesListDispatch;

export interface PagesListItemEditableStateToPropsMapResult {
  pagesFilter: PagesFilter;
  pageOperationStatus: DataOperationState;
  mealOperationStatuses: MealOperationStatus[];
  notesForPageFetchState: DataFetchState;
  notesForMealFetchStates: NotesForMealFetchState[];
}

export interface PagesListItemEditableDispatchToPropsMapResult {
  deleteDraftPage: (draftPageId: number) => void;
  setEditableForPages: (pagesIds: number[], editable: boolean) => void;
  createPage: CreatePageDispatchProp;
  editPage: EditPageDispatchProp;
  getPages: GetPagesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): PagesListItemEditableStateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter.params,
    pageOperationStatus: state.pages.operations.status,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
  };
};

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): PagesListItemEditableDispatchToPropsMapResult => {
  const createPageProp: CreatePageDispatchProp = (page: PageCreateEdit) => {
    return dispatch(createPage(page));
  };

  const editPageProp: EditPageDispatchProp = (request: PageEditRequest) => {
    return dispatch(editPage(request));
  };

  const getPagesProp: GetPagesListDispatchProp = (filter: PagesFilter) => {
    return dispatch(getPages(filter));
  };

  return {
    deleteDraftPage: (draftPageId: number): void => {
      dispatch(deleteDraftPage(draftPageId));
    },

    setEditableForPages: (pagesIds: number[], editable: boolean): void => {
      dispatch(setEditableForPages(pagesIds, editable));
    },

    createPage: createPageProp,
    editPage: editPageProp,
    getPages: getPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItemEditable);
