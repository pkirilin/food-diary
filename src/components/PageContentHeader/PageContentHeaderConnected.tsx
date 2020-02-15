import { connect } from 'react-redux';
import PageContentHeader from './PageContentHeader';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pageDate?: string;
  visiblePagesIds: number[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageDate: state.notes.list.notesForPage?.date,
    visiblePagesIds: state.pages.list.pageItems.map(p => p.id),
  };
};

export default connect(mapStateToProps)(PageContentHeader);
