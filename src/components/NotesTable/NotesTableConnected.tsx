import { connect } from 'react-redux';
import NotesTable from './NotesTable';
import { FoodDiaryState } from '../../store';
import { MealItem } from '../../models';

export interface StateToPropsMapResult {
  mealItemsWithNotes: MealItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    mealItemsWithNotes: state.notes.list.mealItemsWithNotes,
  };
};

export default connect(mapStateToProps)(NotesTable);
