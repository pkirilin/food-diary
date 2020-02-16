import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState, NotesForPageState, MealOperationStatus } from '../../store';

export interface StateToPropsMapResult {
  notesForPageData: NotesForPageState;
  mealOperationStatuses: MealOperationStatus[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    notesForPageData: state.notes.list.notesForPage,
    mealOperationStatuses: state.notes.operations.mealOperationStatuses,
  };
};

export default connect(mapStateToProps)(NotesTable);
