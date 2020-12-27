import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { RootState, NotesForMealFetchState } from '../../store';
import { NoteItem } from '../../models';

export interface NotesTableStateToPropsMapResult {
  noteItems: NoteItem[];
  notesForMealFetchStates: NotesForMealFetchState[];
}

const mapStateToProps = (state: RootState): NotesTableStateToPropsMapResult => {
  return {
    noteItems: state.notes.list.noteItems,
    notesForMealFetchStates: state.notes.list.notesForMealFetchStates,
  };
};

export default connect(mapStateToProps)(NotesTable);
