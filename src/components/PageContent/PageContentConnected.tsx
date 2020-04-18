import { connect } from 'react-redux';
import PageContent from './PageContent';
import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
} from '../../action-types';
import { FoodDiaryState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { ProductDropdownItem, NotesSearchRequest, NoteItem } from '../../models';
import { getNotesForPage } from '../../action-creators';

export interface StateToPropsMapResult {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
}

export interface DispatchToPropsMapResult {
  getContent: (request: NotesSearchRequest) => Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    loading: state.notes.list.notesForPageFetchState.loading,
    loaded: state.notes.list.notesForPageFetchState.loaded,
    errorMessage: state.notes.list.notesForPageFetchState.error,
  };
};

type PageContentDispatchType = ThunkDispatch<
  NoteItem[],
  NotesSearchRequest,
  GetNotesForPageSuccessAction | GetNotesForPageErrorAction
> &
  ThunkDispatch<ProductDropdownItem[], void, GetProductDropdownItemsSuccessAction | GetProductDropdownItemsErrorAction>;

const mapDispatchToProps = (dispatch: PageContentDispatchType): DispatchToPropsMapResult => {
  return {
    getContent: (request: NotesSearchRequest): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
      return dispatch(getNotesForPage(request));
    },
  };
};

const PageContentConnected = connect(mapStateToProps, mapDispatchToProps)(PageContent);

export default PageContentConnected;
