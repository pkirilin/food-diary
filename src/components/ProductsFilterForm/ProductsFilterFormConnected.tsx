import { connect } from 'react-redux';
import ProductsFilterForm from './ProductsFilterForm';
import { Dispatch } from 'redux';
import { CloseModalAction, UpdateProductsFilterAction } from '../../action-types';
import { closeModal, updateProductsFilter } from '../../action-creators';
import { RootState } from '../../store';
import { ProductsFilter } from '../../models';

type ProductsFilterFormDispatch = Dispatch<CloseModalAction | UpdateProductsFilterAction>;

export interface ProductsFilterFormStateToPropsMapResult {
  productsFilter: ProductsFilter;
}

export interface ProductsFilterFormDispatchToPropsMapResult {
  closeModal: () => void;
  updateProductsFilter: (updatedFilter: ProductsFilter) => void;
}

const mapStateToProps = (state: RootState): ProductsFilterFormStateToPropsMapResult => {
  return {
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: ProductsFilterFormDispatch): ProductsFilterFormDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },

    updateProductsFilter: (updatedFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsFilterForm);
