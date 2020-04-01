import { connect } from 'react-redux';
import CategoryContent from './CategoryContent';
import { Dispatch } from 'redux';
import { UpdateProductsFilterAction } from '../../action-types';
import { updateProductsFilter } from '../../action-creators';
import { ProductsFilter } from '../../models';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  productsFilter: ProductsFilter;
}

export interface DispatchToPropsMapResult {
  updateProductsFilter: (productsFilter: ProductsFilter) => void;
}

type CategoryContentDispatch = Dispatch<UpdateProductsFilterAction>;

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productsFilter: state.products.filter,
  };
};

const mapDispatchToProps = (dispatch: CategoryContentDispatch): DispatchToPropsMapResult => {
  return {
    updateProductsFilter: (productsFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(productsFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryContent);
