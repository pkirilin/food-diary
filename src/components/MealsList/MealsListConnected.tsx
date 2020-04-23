import { connect } from 'react-redux';
import MealsList from './MealsList';
import { FoodDiaryState, DataFetchState } from '../../store';

export interface StateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
  };
};

export default connect(mapStateToProps)(MealsList);
