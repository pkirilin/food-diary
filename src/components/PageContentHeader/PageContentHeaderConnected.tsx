import { connect } from 'react-redux';
import PageContentHeader from './PageContentHeader';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  pageDate?: string;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageDate: state.notes.list.notesForPage.data?.date,
  };
};

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(PageContentHeader);
