import { connect } from 'react-redux';
import MealsList from './MealsList';
import { FoodDiaryState } from '../../store';
import { MealItem } from '../../models';

export interface StateToPropsMapResult {
  meals?: MealItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    meals: state.notes.list.notesForPage?.meals,
  };
};

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(MealsList);
