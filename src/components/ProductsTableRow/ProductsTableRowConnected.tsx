import { connect } from 'react-redux';
import ProductsTableRow from './ProductsTableRow';
import { FoodDiaryState } from '../../store';
import {
  SetEditableForProductAction,
  GetProductsListDispatch,
  EditProductDispatch,
  DeleteProductDispatch,
  GetCategoryDropdownItemsDispatch,
  GetCategoriesListDispatch,
  GetProductsListDispatchProp,
  GetCategoryDropdownItemsDispatchProp,
  GetCategoriesListDispatchProp,
  EditProductDispatchProp,
  DeleteProductDispatchProp,
} from '../../action-types';
import { Dispatch } from 'redux';
import {
  setEditableForProduct,
  deleteProduct,
  getProducts,
  editProduct,
  getCategoryDropdownItems,
  getCategories,
} from '../../action-creators';
import { CategoryDropdownItem, ProductsFilter, ProductEditRequest, CategoryDropdownSearchRequest } from '../../models';

type ProductsTableRowDispatch = Dispatch<SetEditableForProductAction> &
  GetProductsListDispatch &
  EditProductDispatch &
  DeleteProductDispatch &
  GetCategoryDropdownItemsDispatch &
  GetCategoriesListDispatch;

export interface ProductsTableRowStateToPropsMapResult {
  editableProductsIds: number[];
  categoryDropdownItems: CategoryDropdownItem[];
  isProductOperationInProcess: boolean;
  isCategoryDropdownContentLoading: boolean;
  productsFilter: ProductsFilter;
}

export interface ProductsTableRowDispatchToPropsMapResult {
  setEditableForProduct: (productId: number, editable: boolean) => void;
  getProducts: GetProductsListDispatchProp;
  getCategoryDropdownItems: GetCategoryDropdownItemsDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
  editProduct: EditProductDispatchProp;
  deleteProduct: DeleteProductDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): ProductsTableRowStateToPropsMapResult => {
  return {
    editableProductsIds: state.products.list.editableProductsIds,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    isCategoryDropdownContentLoading: state.categories.dropdown.categoryDropdownItemsFetchState.loading,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (dispatch: ProductsTableRowDispatch): ProductsTableRowDispatchToPropsMapResult => {
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

  const editProductProp: EditProductDispatchProp = (request: ProductEditRequest) => {
    return dispatch(editProduct(request));
  };

  const deleteProductProp: DeleteProductDispatchProp = (productId: number) => {
    return dispatch(deleteProduct(productId));
  };

  return {
    setEditableForProduct: (productId: number, editable: boolean): void => {
      dispatch(setEditableForProduct(productId, editable));
    },

    getProducts: getProductsProp,
    getCategoryDropdownItems: getCategoryDropdownItemsProp,
    getCategories: getCategoriesProp,
    editProduct: editProductProp,
    deleteProduct: deleteProductProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRow);
