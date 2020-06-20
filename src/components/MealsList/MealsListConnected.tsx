import { connect } from 'react-redux';
import MealsList from './MealsList';
import { DataFetchState, RootState } from '../../store';

export interface MealsListStateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

const mapStateToProps = (state: RootState): MealsListStateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
  };
};

export default connect(mapStateToProps)(MealsList);
