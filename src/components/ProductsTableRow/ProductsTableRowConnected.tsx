import { connect } from 'react-redux';
import ProductsTableRow from './ProductsTableRow';
import { FoodDiaryState } from '../../store';
import {
  SetEditableForProductAction,
  DeleteProductSuccessAction,
  DeleteProductErrorAction,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
  EditProductSuccessAction,
  EditProductErrorAction,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import {
  setEditableForProduct,
  deleteProduct,
  getProducts,
  editProduct,
  getCategoryDropdownItems,
} from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import {
  ProductItem,
  CategoryDropdownItem,
  ProductsFilter,
  ProductEditRequest,
  CategoryDropdownSearchRequest,
} from '../../models';

export interface StateToPropsMapResult {
  editableProductsIds: number[];
  categoryDropdownItems: CategoryDropdownItem[];
  isProductOperationInProcess: boolean;
  isCategoryDropdownContentLoading: boolean;
  productsFilter: ProductsFilter;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    editableProductsIds: state.products.list.editableProductsIds,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    isCategoryDropdownContentLoading: state.categories.dropdown.categoryDropdownItemsFetchState.loading,
    productsFilter: state.products.filter,
  };
};

export interface DispatchToPropsMapResult {
  setEditableForProduct: (productId: number, editable: boolean) => void;
  getProducts: (productsFilter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  getCategoryDropdownItems: (
    request: CategoryDropdownSearchRequest,
  ) => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;
  editProduct: (request: ProductEditRequest) => Promise<EditProductSuccessAction | EditProductErrorAction>;
  deleteProduct: (productId: number) => Promise<DeleteProductSuccessAction | DeleteProductErrorAction>;
}

type ProductsTableRowDispatch = Dispatch<SetEditableForProductAction> &
  ThunkDispatch<ProductItem[], ProductsFilter, GetProductsListSuccessAction | GetProductsListErrorAction> &
  ThunkDispatch<void, ProductEditRequest, EditProductSuccessAction | EditProductErrorAction> &
  ThunkDispatch<void, number, DeleteProductSuccessAction | DeleteProductErrorAction> &
  ThunkDispatch<
    CategoryDropdownItem[],
    CategoryDropdownSearchRequest,
    GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
  >;

const mapDispatchToProps = (dispatch: ProductsTableRowDispatch): DispatchToPropsMapResult => {
  return {
    setEditableForProduct: (productId: number, editable: boolean): void => {
      dispatch(setEditableForProduct(productId, editable));
    },
    getProducts: (
      productsFilter: ProductsFilter,
    ): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts(productsFilter));
    },
    getCategoryDropdownItems: (
      request: CategoryDropdownSearchRequest,
    ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
      return dispatch(getCategoryDropdownItems(request));
    },
    editProduct: (request: ProductEditRequest): Promise<EditProductSuccessAction | EditProductErrorAction> => {
      return dispatch(editProduct(request));
    },
    deleteProduct: (productId: number): Promise<DeleteProductSuccessAction | DeleteProductErrorAction> => {
      return dispatch(deleteProduct(productId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRow);
