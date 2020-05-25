import { connect } from 'react-redux';
import CategoriesListControlsTop from './CategoriesListControlsTop';
import { ProductsFilter } from '../../models';
import {
  CreateDraftCategoryAction,
  GetCategoriesListDispatch,
  GetProductsListDispatch,
  GetCategoriesListDispatchProp,
  GetProductsListDispatchProp,
  OpenModalAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { getCategories, getProducts, openModal } from '../../action-creators';
import { RootState, ModalBody, ModalOptions } from '../../store';

type CategoriesListControlsTopDispatch = Dispatch<OpenModalAction> &
  GetCategoriesListDispatch &
  GetProductsListDispatch &
  Dispatch<CreateDraftCategoryAction>;

export interface CategoriesListControlsTopStateToPropsMapResult {
  isCategoryOperationInProcess: boolean;
  isProductOperationInProcess: boolean;
  areCategoriesLoading: boolean;
  areProductsLoading: boolean;
  productsFilter: ProductsFilter;
}

export interface CategoriesListControlsTopDispatchToPropsMapResult {
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
  getCategories: GetCategoriesListDispatchProp;
  getProducts: GetProductsListDispatchProp;
}

const mapStateToProps = (state: RootState): CategoriesListControlsTopStateToPropsMapResult => {
  return {
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    areCategoriesLoading: state.categories.list.categoryItemsFetchState.loading,
    areProductsLoading: state.products.list.productItemsFetchState.loading,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (
  dispatch: CategoriesListControlsTopDispatch,
): CategoriesListControlsTopDispatchToPropsMapResult => {
  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  const getProductsProp: GetProductsListDispatchProp = (filter: ProductsFilter) => {
    return dispatch(getProducts(filter));
  };

  return {
    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },

    getCategories: getCategoriesProp,
    getProducts: getProductsProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListControlsTop);
