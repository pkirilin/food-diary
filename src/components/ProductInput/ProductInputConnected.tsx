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
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
} from '../../action-types';
import { ThunkDispatch } from 'redux-thunk';
import {
  ProductCreateEdit,
  ProductItem,
  CategoryDropdownItem,
  ProductsFilter,
  CategoryItem,
  CategoryDropdownSearchRequest,
} from '../../models';
import { createProduct, getProducts, getCategoryDropdownItems, getCategories } from '../../action-creators';

export interface StateToPropsMapResult {
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  categoryItems: CategoryItem[];
  categoryDropdownItems: CategoryDropdownItem[];
  categoryDropdownItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    categoryItems: state.categories.list.categoryItems,
    categoryDropdownItems: state.categories.dropdown.categoryDropdownItems,
    categoryDropdownItemsFetchState: state.categories.dropdown.categoryDropdownItemsFetchState,
    productsFilter: state.products.filter,
  };
};

export interface DispatchToPropsMapResult {
  createProduct: (product: ProductCreateEdit) => Promise<CreateProductSuccessAction | CreateProductErrorAction>;
  getProducts: (productsFilter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  getCategoryDropdownItems: (
    request: CategoryDropdownSearchRequest,
  ) => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

type ProductInputDispatch = ThunkDispatch<
  void,
  ProductCreateEdit,
  CreateProductSuccessAction | CreateProductErrorAction
> &
  ThunkDispatch<ProductItem[], ProductsFilter, GetProductsListSuccessAction | GetProductsListErrorAction> &
  ThunkDispatch<
    CategoryDropdownItem[],
    CategoryDropdownSearchRequest,
    GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
  > &
  ThunkDispatch<CategoryItem[], void, GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;

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
    getCategoryDropdownItems: (
      request: CategoryDropdownSearchRequest,
    ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
      return dispatch(getCategoryDropdownItems(request));
    },
    getCategories: (): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductInput);
