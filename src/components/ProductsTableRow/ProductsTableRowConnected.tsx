import { connect } from 'react-redux';
import ProductsTableRow from './ProductsTableRow';
import { RootState } from '../../store';
import {
  SetEditableForProductAction,
  GetProductsListDispatch,
  DeleteProductDispatch,
  GetCategoriesListDispatch,
  GetProductsListDispatchProp,
  GetCategoriesListDispatchProp,
  DeleteProductDispatchProp,
} from '../../action-types';
import { Dispatch } from 'redux';
import { setEditableForProduct, deleteProduct, getProducts, getCategories } from '../../action-creators';
import { ProductsFilter } from '../../models';

type ProductsTableRowDispatch = Dispatch<SetEditableForProductAction> &
  GetProductsListDispatch &
  GetCategoriesListDispatch &
  DeleteProductDispatch;

export interface ProductsTableRowStateToPropsMapResult {
  editableProductsIds: number[];
  isProductOperationInProcess: boolean;
  isCategoryOperationInProcess: boolean;
  productsFilter: ProductsFilter;
}

export interface ProductsTableRowDispatchToPropsMapResult {
  setEditableForProduct: (productId: number, editable: boolean) => void;
  getProducts: GetProductsListDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
  deleteProduct: DeleteProductDispatchProp;
}

const mapStateToProps = (state: RootState): ProductsTableRowStateToPropsMapResult => {
  return {
    editableProductsIds: state.products.list.editableProductsIds,
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
    setEditableForProduct: (productId: number, editable: boolean): void => {
      dispatch(setEditableForProduct(productId, editable));
    },

    getProducts: getProductsProp,
    getCategories: getCategoriesProp,
    deleteProduct: deleteProductProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRow);
