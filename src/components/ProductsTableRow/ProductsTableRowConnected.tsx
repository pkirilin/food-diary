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
import { ProductItem, ProductCreateEdit, CategoryDropdownItem } from '../../models';

export interface StateToPropsMapResult {
  editableProductsIds: number[];
  categoryDropdownItems: CategoryDropdownItem[];
  isProductOperationInProcess: boolean;
  isCategoryDropdownContentLoading: boolean;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    editableProductsIds: state.products.list.editableProductsIds,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    isCategoryDropdownContentLoading: state.categories.dropdown.categoryDropdownItemsFetchState.loading,
  };
};

export interface DispatchToPropsMapResult {
  setEditableForProduct: (productId: number, editable: boolean) => void;
  getProducts: () => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  getCategoryDropdownItems: () => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;
  editProduct: (product: ProductCreateEdit) => Promise<EditProductSuccessAction | EditProductErrorAction>;
  deleteProduct: (productId: number) => Promise<DeleteProductSuccessAction | DeleteProductErrorAction>;
}

type ProductsTableRowDispatch = Dispatch<SetEditableForProductAction> &
  ThunkDispatch<ProductItem, void, GetProductsListSuccessAction | GetProductsListErrorAction> &
  ThunkDispatch<void, ProductCreateEdit, EditProductSuccessAction | EditProductErrorAction> &
  ThunkDispatch<void, number, DeleteProductSuccessAction | DeleteProductErrorAction> &
  ThunkDispatch<
    CategoryDropdownItem[],
    void,
    GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
  >;

const mapDispatchToProps = (dispatch: ProductsTableRowDispatch): DispatchToPropsMapResult => {
  return {
    setEditableForProduct: (productId: number, editable: boolean): void => {
      dispatch(setEditableForProduct(productId, editable));
    },
    getProducts: (): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts());
    },
    getCategoryDropdownItems: (): Promise<
      GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
    > => {
      return dispatch(getCategoryDropdownItems());
    },
    editProduct: (product: ProductCreateEdit): Promise<EditProductSuccessAction | EditProductErrorAction> => {
      return dispatch(editProduct(product));
    },
    deleteProduct: (productId: number): Promise<DeleteProductSuccessAction | DeleteProductErrorAction> => {
      return dispatch(deleteProduct(productId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTableRow);
