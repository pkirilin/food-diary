import { connect } from 'react-redux';
import ProductsTableRow from './ProductsTableRow';
import { RootState, ModalBody, ModalOptions } from '../../store';
import {
  GetProductsListDispatch,
  DeleteProductDispatch,
  GetCategoriesListDispatch,
  GetProductsListDispatchProp,
  GetCategoriesListDispatchProp,
  DeleteProductDispatchProp,
  OpenModalAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { deleteProduct, getProducts, getCategories, openConfirmationModal, openModal } from '../../action-creators';
import { ProductsFilter } from '../../models';

type ProductsTableRowDispatch = Dispatch<OpenModalAction> &
  GetProductsListDispatch &
  GetCategoriesListDispatch &
  DeleteProductDispatch;

export interface ProductsTableRowStateToPropsMapResult {
  isProductOperationInProcess: boolean;
  isCategoryOperationInProcess: boolean;
  productsFilter: ProductsFilter;
}

export interface ProductsTableRowDispatchToPropsMapResult {
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
  openConfirmationModal: (title: string, message: string, confirm: () => void) => void;
  getProducts: GetProductsListDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
  deleteProduct: DeleteProductDispatchProp;
}

const mapStateToProps = (state: RootState): ProductsTableRowStateToPropsMapResult => {
  return {
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: ProductsTableRowDispatch): ProductsTableRowDispatchToPropsMapResult => {
  const getProductsProp: GetProductsListDispatchProp = (productsFilter: ProductsFilter) => {
    return dispatch(getProducts(productsFilter));
  };

  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  const deleteProductProp: DeleteProductDispatchProp = (productId: number) => {
    return dispatch(deleteProduct(productId));
  };

  return {
    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },

    openConfirmationModal: (title: string, message: string, confirm: () => void): void => {
      dispatch(openConfirmationModal(title, message, confirm));
    },

    getProducts: getProductsProp,
    getCategories: getCategoriesProp,
    deleteProduct: deleteProductProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRow);
