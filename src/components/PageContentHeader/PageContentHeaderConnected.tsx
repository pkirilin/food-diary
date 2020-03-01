import { connect } from 'react-redux';
import PageContentHeader from './PageContentHeader';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pageDate?: string;
  visiblePagesIds: number[];
  isPageContentLoading: boolean;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageDate: state.notes.list.notesForPage?.date,
    visiblePagesIds: state.pages.list.pageItems.map(p => p.id),
    isPageContentLoading: state.notes.list.notesForPageFetchState.loading,
  };
};

export default connect(mapStateToProps)(PageContentHeader);
