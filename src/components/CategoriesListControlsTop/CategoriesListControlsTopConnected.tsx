import { connect } from 'react-redux';
import CategoriesListControlsTop from './CategoriesListControlsTop';
import { CategoryItem, ProductsFilter } from '../../models';
import {
  CreateDraftCategoryAction,
  GetCategoriesListDispatch,
  GetProductsListDispatch,
  GetCategoriesListDispatchProp,
  GetProductsListDispatchProp,
} from '../../action-types';
import { Dispatch } from 'redux';
import { createDraftCategory, getCategories, getProducts } from '../../action-creators';
import { FoodDiaryState } from '../../store';

type CategoriesListControlsTopDispatch = GetCategoriesListDispatch &
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
  getCategories: GetCategoriesListDispatchProp;
  getProducts: GetProductsListDispatchProp;
  createDraftCategory: (draftCategory: CategoryItem) => void;
}

const mapStateToProps = (state: FoodDiaryState): CategoriesListControlsTopStateToPropsMapResult => {
  return {
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    areCategoriesLoading: state.categories.list.categoryItemsFetchState.loading,
    areProductsLoading: state.products.list.productItemsFetchState.loading,
    productsFilter: state.products.filter,
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
    getCategories: getCategoriesProp,
    getProducts: getProductsProp,
    createDraftCategory: (draftCategory: CategoryItem): void => {
      dispatch(createDraftCategory(draftCategory));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListControlsTop);
