import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState, NotesForMealFetchState } from '../../store';
import { NoteItem } from '../../models';

export interface StateToPropsMapResult {
  noteItems: NoteItem[];
  notesForMealFetchStates: NotesForMealFetchState[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    noteItems: state.notes.list.noteItems,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
  };
};

export default connect(mapStateToProps)(NotesTable);
