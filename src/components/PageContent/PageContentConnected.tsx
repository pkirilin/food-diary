import { connect } from 'react-redux';
import PageContent from './PageContent';
import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetProductDropdownItemsSuccessAction,
  GetProductDropdownItemsErrorAction,
} from '../../action-types';
import { FoodDiaryState, DataFetchState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { ProductDropdownItem, NotesSearchRequest, NoteItem } from '../../models';
import { getNotesForPage } from '../../action-creators';

export interface StateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

export interface DispatchToPropsMapResult {
  getNotesForPage: (request: NotesSearchRequest) => Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
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
    getNotesForPage: (
      request: NotesSearchRequest,
    ): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
      return dispatch(getNotesForPage(request));
    },
  };
};

const PageContentConnected = connect(mapStateToProps, mapDispatchToProps)(PageContent);

export default PageContentConnected;
