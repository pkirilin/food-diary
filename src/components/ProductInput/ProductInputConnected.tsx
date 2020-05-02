import { connect } from 'react-redux';
import ProductInput from './ProductInput';
import { FoodDiaryState, DataOperationState, DataFetchState } from '../../store';
import {
  CreateProductDispatch,
  GetProductsListDispatch,
  GetCategoryDropdownItemsDispatch,
  GetCategoriesListDispatch,
  CreateProductDispatchProp,
  GetProductsListDispatchProp,
  GetCategoryDropdownItemsDispatchProp,
  GetCategoriesListDispatchProp,
} from '../../action-types';
import {
  ProductCreateEdit,
  CategoryDropdownItem,
  ProductsFilter,
  CategoryItem,
  CategoryDropdownSearchRequest,
} from '../../models';
import { createProduct, getProducts, getCategoryDropdownItems, getCategories } from '../../action-creators';

type ProductInputDispatch = CreateProductDispatch &
  GetProductsListDispatch &
  GetCategoryDropdownItemsDispatch &
  GetCategoriesListDispatch;

export interface ProductInputStateToPropsMapResult {
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  categoryItems: CategoryItem[];
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

export interface ProductInputDispatchToPropsMapResult {
  createProduct: CreateProductDispatchProp;
  getProducts: GetProductsListDispatchProp;
  getCategoryDropdownItems: GetCategoryDropdownItemsDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): ProductInputStateToPropsMapResult => {
  return {
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    categoryItems: state.categories.list.categoryItems,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    categoryDropdownItemsFetchState: state.categories.dropdown.categoryDropdownItemsFetchState,
    productsFilter: state.products.filter,
  };
};

const mapDispatchToProps = (dispatch: ProductInputDispatch): ProductInputDispatchToPropsMapResult => {
  const createProductProp: CreateProductDispatchProp = (product: ProductCreateEdit) => {
    return dispatch(createProduct(product));
  };

  const getProductsProp: GetProductsListDispatchProp = (productsFilter: ProductsFilter) => {
    return dispatch(getProducts(productsFilter));
  };

  const getCategoryDropdownItemsProp: GetCategoryDropdownItemsDispatchProp = (
    request: CategoryDropdownSearchRequest,
  ) => {
    return dispatch(getCategoryDropdownItems(request));
  };

  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  return {
    createProduct: createProductProp,
    getProducts: getProductsProp,
    getCategoryDropdownItems: getCategoryDropdownItemsProp,
    getCategories: getCategoriesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductInput);
