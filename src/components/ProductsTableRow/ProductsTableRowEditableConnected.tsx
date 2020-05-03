import { connect } from 'react-redux';
import ProductsTableRowEditable from './ProductsTableRowEditable';
import { RootState, DataFetchState } from '../../store';
import { CategoryDropdownItem, ProductsFilter, CategoryDropdownSearchRequest, ProductEditRequest } from '../../models';
import {
  GetCategoryDropdownItemsDispatchProp,
  EditProductDispatchProp,
  GetProductsListDispatchProp,
  SetEditableForProductAction,
  GetCategoryDropdownItemsDispatch,
  EditProductDispatch,
  GetProductsListDispatch,
} from '../../action-types';
import { getProducts, getCategoryDropdownItems, editProduct, setEditableForProduct } from '../../action-creators';
import { Dispatch } from 'redux';

type ProductsTableRowEditableDispatch = Dispatch<SetEditableForProductAction> &
  GetCategoryDropdownItemsDispatch &
  EditProductDispatch &
  GetProductsListDispatch;

export interface ProductsTableRowEditableStateToPropsMapResult {
  isProductOperationInProcess: boolean;
  isCategoryOperationInProcess: boolean;
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

export interface ProductsTableRowEditableDispatchToPropsMapResult {
  setEditableForProduct: (productId: number, editable: boolean) => void;
  getCategoryDropdownItems: GetCategoryDropdownItemsDispatchProp;
  editProduct: EditProductDispatchProp;
  getProducts: GetProductsListDispatchProp;
}

const mapStateToProps = (state: RootState): ProductsTableRowEditableStateToPropsMapResult => {
  return {
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    categoryDropdownItemsFetchState: state.categories.dropdown.categoryDropdownItemsFetchState,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (
  dispatch: ProductsTableRowEditableDispatch,
): ProductsTableRowEditableDispatchToPropsMapResult => {
  const getProductsProp: GetProductsListDispatchProp = (productsFilter: ProductsFilter) => {
    return dispatch(getProducts(productsFilter));
  };

  const getCategoryDropdownItemsProp: GetCategoryDropdownItemsDispatchProp = (
    request: CategoryDropdownSearchRequest,
  ) => {
    return dispatch(getCategoryDropdownItems(request));
  };

  const editProductProp: EditProductDispatchProp = (request: ProductEditRequest) => {
    return dispatch(editProduct(request));
  };

  return {
    setEditableForProduct: (productId: number, editable: boolean): void => {
      dispatch(setEditableForProduct(productId, editable));
    },

    getProducts: getProductsProp,
    getCategoryDropdownItems: getCategoryDropdownItemsProp,
    editProduct: editProductProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRowEditable);
