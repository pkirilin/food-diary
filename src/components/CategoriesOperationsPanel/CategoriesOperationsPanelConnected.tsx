import { connect } from 'react-redux';
import CategoriesOperationsPanel from './CategoriesOperationsPanel';
import { FoodDiaryState, DataOperationState } from '../../store';

export interface CategoriesOperationsPanelStateToPropsMapResult {
  categoryOperationStatus: DataOperationState;
}

const mapStateToProps = (state: FoodDiaryState): CategoriesOperationsPanelStateToPropsMapResult => {
  return {
    categoryOperationStatus: state.categories.operations.status,
  };
};

export default connect(mapStateToProps)(CategoriesOperationsPanel);
