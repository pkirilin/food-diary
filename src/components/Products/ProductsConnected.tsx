import Products from './Products';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';
import { ProductsFilter } from '../../models';
import { FoodDiaryState } from '../../store';

type ProductsDispatch = Dispatch<ClearProductsFilterAction>;

export interface ProductsStateToPropsMapResult {
  productsFilter: ProductsFilter;
}

export interface ProductsDispatchToPropsMapResult {
  clearProductsFilter: () => void;
}

const mapStateToProps = (state: FoodDiaryState): ProductsStateToPropsMapResult => {
  return {
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: ProductsDispatch): ProductsDispatchToPropsMapResult => {
  return {
    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
