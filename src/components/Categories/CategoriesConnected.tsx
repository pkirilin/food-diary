import { connect } from 'react-redux';
import Categories from './Categories';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';

export interface StateToPropsMapResult {
  firstCategoryId?: number;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    firstCategoryId: state.categories.list.categoryItems.filter(c => c.id > 0)[0]?.id,
  };
};

export interface DispatchToPropsMapResult {
  clearProductsFilter: () => void;
}

type CategoriesDispatch = Dispatch<ClearProductsFilterAction>;

const mapDispatchToProps = (dispatch: CategoriesDispatch): DispatchToPropsMapResult => {
  return {
    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
