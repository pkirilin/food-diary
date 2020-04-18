import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState } from '../../store';
import { NoteItem } from '../../models';

export interface StateToPropsMapResult {
  noteItems: NoteItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    noteItems: state.notes.list.noteItems,
  };
};

export default connect(mapStateToProps)(NotesTable);
