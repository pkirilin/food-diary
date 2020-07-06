import { connect } from 'react-redux';
import ProductInput from './ProductInput';
import { RootState, DataFetchState } from '../../store';
import {
  CreateProductDispatch,
  GetProductsListDispatch,
  GetCategoryDropdownItemsDispatch,
  GetCategoriesListDispatch,
  CreateProductDispatchProp,
  GetProductsListDispatchProp,
  GetCategoryDropdownItemsDispatchProp,
  GetCategoriesListDispatchProp,
  CloseModalAction,
  EditProductDispatchProp,
  EditProductDispatch,
} from '../../action-types';
import {
  ProductCreateEdit,
  CategoryDropdownItem,
  ProductsFilter,
  CategoryItem,
  CategoryDropdownSearchRequest,
  ProductEditRequest,
} from '../../models';
import {
  createProduct,
  getProducts,
  getCategoryDropdownItems,
  getCategories,
  closeModal,
  editProduct,
} from '../../action-creators';
import { Dispatch } from 'redux';

type ProductInputDispatch = Dispatch<CloseModalAction> &
  CreateProductDispatch &
  EditProductDispatch &
  GetProductsListDispatch &
  GetCategoryDropdownItemsDispatch &
  GetCategoriesListDispatch;

export interface ProductInputStateToPropsMapResult {
  categoryItems: CategoryItem[];
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

export interface ProductInputDispatchToPropsMapResult {
  closeModal: () => void;
  createProduct: CreateProductDispatchProp;
  editProduct: EditProductDispatchProp;
  getProducts: GetProductsListDispatchProp;
  getCategoryDropdownItems: GetCategoryDropdownItemsDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
}

const mapStateToProps = (state: RootState): ProductInputStateToPropsMapResult => {
  return {
    categoryItems: state.categories.list.categoryItems,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    categoryDropdownItemsFetchState: state.categories.dropdown.categoryDropdownItemsFetchState,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: ProductInputDispatch): ProductInputDispatchToPropsMapResult => {
  const createProductProp: CreateProductDispatchProp = (product: ProductCreateEdit) => {
    return dispatch(createProduct(product));
  };

  const editProductProp: EditProductDispatchProp = (request: ProductEditRequest) => {
    return dispatch(editProduct(request));
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
    closeModal: (): void => {
      dispatch(closeModal());
    },

    createProduct: createProductProp,
    editProduct: editProductProp,
    getProducts: getProductsProp,
    getCategoryDropdownItems: getCategoryDropdownItemsProp,
    getCategories: getCategoriesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductInput);
