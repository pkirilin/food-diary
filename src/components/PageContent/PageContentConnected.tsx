import { connect } from 'react-redux';
import PageContent from './PageContent';
import { GetNotesListSuccessAction, GetNotesListErrorAction } from '../../action-types';
import { FoodDiaryState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { NotesForPage } from '../../models';
import { getNotes } from '../../action-creators';

export interface StateToPropsMapResult {
  loading: boolean;
  loaded: boolean;
  pageDate?: string;
  errorMessage?: string;
}

export interface DispatchToPropsMapResult {
  getContent: (pageId: number) => Promise<GetNotesListSuccessAction | GetNotesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    loading: state.notes.list.notesForPage.loading,
    loaded: state.notes.list.notesForPage.loaded,
    pageDate: state.notes.list.notesForPage.data?.date,
    errorMessage: state.notes.list.notesForPage.error,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<NotesForPage, number, GetNotesListSuccessAction | GetNotesListErrorAction>,
): DispatchToPropsMapResult => {
  return {
    getContent: (pageId: number): Promise<GetNotesListSuccessAction | GetNotesListErrorAction> => {
      return dispatch(getNotes(pageId));
    },
  };
};

const PageContentConnected = connect(mapStateToProps, mapDispatchToProps)(PageContent);

export default PageContentConnected;
