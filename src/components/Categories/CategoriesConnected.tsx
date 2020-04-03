import { connect } from 'react-redux';
import Categories from './Categories';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';

export interface StateToPropsMapResult {
  isCategoriesListAvailable: boolean;
  firstCategoryId?: number;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isCategoriesListAvailable: state.categories.list.categoryItemsFetchState.loaded,
    firstCategoryId:
      state.categories.list.categoryItems.length > 0 ? state.categories.list.categoryItems[0].id : undefined,
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
