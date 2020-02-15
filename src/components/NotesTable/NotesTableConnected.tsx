import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState, NotesForPageState } from '../../store';

export interface StateToPropsMapResult {
  notesForPageData: NotesForPageState;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    notesForPageData: state.notes.list.notesForPage,
  };
};

export default connect(mapStateToProps)(NotesTable);
