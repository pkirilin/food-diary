import Products from './Products';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';
import { ProductsFilter } from '../../models';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  productsFilter: ProductsFilter;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productsFilter: state.products.filter,
  };
};

export interface DispatchToPropsMapResult {
  clearProductsFilter: () => void;
}

type ProductsDispatch = Dispatch<ClearProductsFilterAction>;

const mapDispatchToProps = (dispatch: ProductsDispatch): DispatchToPropsMapResult => {
  return {
    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
