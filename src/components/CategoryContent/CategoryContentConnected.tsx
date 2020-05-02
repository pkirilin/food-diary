import { connect } from 'react-redux';
import CategoryContent from './CategoryContent';
import { Dispatch } from 'redux';
import { UpdateProductsFilterAction } from '../../action-types';
import { updateProductsFilter } from '../../action-creators';
import { ProductsFilter } from '../../models';
import { FoodDiaryState } from '../../store';

type CategoryContentDispatch = Dispatch<UpdateProductsFilterAction>;

export interface CategoryContentStateToPropsMapResult {
  productsFilter: ProductsFilter;
}

export interface CategoryContentDispatchToPropsMapResult {
  updateProductsFilter: (productsFilter: ProductsFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): CategoryContentStateToPropsMapResult => {
  return {
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: CategoryContentDispatch): CategoryContentDispatchToPropsMapResult => {
  return {
    updateProductsFilter: (productsFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(productsFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryContent);
