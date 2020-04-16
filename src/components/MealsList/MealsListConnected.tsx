import { connect } from 'react-redux';
import MealsList from './MealsList';
import { FoodDiaryState } from '../../store';
import { MealItem } from '../../models';

export interface StateToPropsMapResult {
  meals: MealItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    meals: state.notes.list.mealItemsWithNotes,
  };
};

export default connect(mapStateToProps)(MealsList);
