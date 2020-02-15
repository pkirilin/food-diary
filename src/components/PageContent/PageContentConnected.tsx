import { connect } from 'react-redux';
import PageContent from './PageContent';
import { GetNotesForPageSuccessAction, GetNotesForPageErrorAction } from '../../action-types';
import { FoodDiaryState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { NotesForPage } from '../../models';
import { getNotes } from '../../action-creators';

export interface StateToPropsMapResult {
  loading: boolean;
  loaded: boolean;
  errorMessage?: string;
}

export interface DispatchToPropsMapResult {
  getContent: (pageId: number) => Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    loading: state.notes.list.notesForPageFetchState.loading,
    loaded: state.notes.list.notesForPageFetchState.loaded,
    errorMessage: state.notes.list.notesForPageFetchState.error,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<NotesForPage, number, GetNotesForPageSuccessAction | GetNotesForPageErrorAction>,
): DispatchToPropsMapResult => {
  return {
    getContent: (pageId: number): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
      return dispatch(getNotes(pageId));
    },
  };
};

const PageContentConnected = connect(mapStateToProps, mapDispatchToProps)(PageContent);

export default PageContentConnected;
