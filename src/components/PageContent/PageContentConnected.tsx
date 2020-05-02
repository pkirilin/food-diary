import { connect } from 'react-redux';
import PageContent from './PageContent';
import { GetNotesForPageDispatchProp, GetNotesForPageDispatch } from '../../action-types';
import { FoodDiaryState, DataFetchState } from '../../store';
import { NotesSearchRequest } from '../../models';
import { getNotesForPage } from '../../action-creators';

type PageContentDispatch = GetNotesForPageDispatch;

export interface PageContentStateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

export interface PageContentDispatchToPropsMapResult {
  getNotesForPage: GetNotesForPageDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): PageContentStateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
  };
};

const mapDispatchToProps = (dispatch: PageContentDispatch): PageContentDispatchToPropsMapResult => {
  const getNotesForPageProp: GetNotesForPageDispatchProp = (request: NotesSearchRequest) => {
    return dispatch(getNotesForPage(request));
  };

  return {
    getNotesForPage: getNotesForPageProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PageContent);
