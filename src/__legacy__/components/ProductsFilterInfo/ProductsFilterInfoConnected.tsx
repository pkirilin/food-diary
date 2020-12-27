import { connect } from 'react-redux';
import ProductsFilterInfo from './ProductsFilterInfo';
import { ProductsFilter } from '../../models';
import { RootState } from '../../store';
import { Dispatch } from 'redux';
import { UpdateProductsFilterAction } from '../../action-types';
import { updateProductsFilter } from '../../action-creators';

export interface ProductsFilterInfoStateToPropsMapResult {
  productsFilter: ProductsFilter;
}

export interface ProductsFilterInfoDispatchToPropsMapResult {
  updateProductsFilter: (updatedFilter: ProductsFilter) => void;
}

const mapStateToProps = (state: RootState): ProductsFilterInfoStateToPropsMapResult => {
  return {
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch<UpdateProductsFilterAction>,
): ProductsFilterInfoDispatchToPropsMapResult => {
  return {
    updateProductsFilter: (updatedFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsFilterInfo);
