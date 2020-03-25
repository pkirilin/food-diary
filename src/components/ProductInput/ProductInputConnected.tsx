import { connect } from 'react-redux';
import ProductInput from './ProductInput';
import { FoodDiaryState, DataOperationState, DataFetchState } from '../../store';
import {
  CreateProductSuccessAction,
  CreateProductErrorAction,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
} from '../../action-types';
import { ThunkDispatch } from 'redux-thunk';
import { ProductCreateEdit, ProductItem, CategoryDropdownItem, ProductsFilter } from '../../models';
import { createProduct, getProducts, getCategoryDropdownItems } from '../../action-creators';

export interface StateToPropsMapResult {
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  categoryDropdownItems: CategoryDropdownItem[];
  isCategoryDropdownContentLoading: boolean;
  productsFilter: ProductsFilter;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    isCategoryDropdownContentLoading: state.categories.dropdown.categoryDropdownItemsFetchState.loading,
    productsFilter: state.products.filter,
  };
};

export interface DispatchToPropsMapResult {
  createProduct: (product: ProductCreateEdit) => Promise<CreateProductSuccessAction | CreateProductErrorAction>;
  getProducts: (productsFilter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  getCategoryDropdownItems: () => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;
}

type ProductInputDispatch = ThunkDispatch<
  void,
  ProductCreateEdit,
  CreateProductSuccessAction | CreateProductErrorAction
> &
  ThunkDispatch<ProductItem, ProductsFilter, GetProductsListSuccessAction | GetProductsListErrorAction> &
  ThunkDispatch<
    CategoryDropdownItem[],
    void,
    GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
  >;

const mapDispatchToProps = (dispatch: ProductInputDispatch): DispatchToPropsMapResult => {
  return {
    createProduct: (product: ProductCreateEdit): Promise<CreateProductSuccessAction | CreateProductErrorAction> => {
      return dispatch(createProduct(product));
    },
    getProducts: (
      productsFilter: ProductsFilter,
    ): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts(productsFilter));
    },
    getCategoryDropdownItems: (): Promise<
      GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
    > => {
      return dispatch(getCategoryDropdownItems());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductInput);
