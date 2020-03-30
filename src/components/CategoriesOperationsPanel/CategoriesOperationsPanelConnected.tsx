import { connect } from 'react-redux';
import CategoriesOperationsPanel from './CategoriesOperationsPanel';
import { FoodDiaryState, DataOperationState } from '../../store';

export interface StateToPropsMapResult {
  categoryOperationStatus: DataOperationState;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    categoryOperationStatus: state.categories.operations.status,
  };
};

export default connect(mapStateToProps)(CategoriesOperationsPanel);
