import { connect } from 'react-redux';
import CategoriesListControlsTop from './CategoriesListControlsTop';
import { ThunkDispatch } from 'redux-thunk';
import { CategoryItem, ProductsFilter, ProductItem } from '../../models';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  CreateDraftCategoryAction,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { createDraftCategory, getCategories, getProducts } from '../../action-creators';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isCategoryOperationInProcess: boolean;
  isProductOperationInProcess: boolean;
  areCategoriesLoading: boolean;
  areProductsLoading: boolean;
  productsFilter: ProductsFilter;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    areCategoriesLoading: state.categories.list.categoryItemsFetchState.loading,
    areProductsLoading: state.products.list.productItemsFetchState.loading,
    productsFilter: state.products.filter,
  };
};

export interface DispatchToPropsMapResult {
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
  getProducts: (filter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  createDraftCategory: (draftCategory: CategoryItem) => void;
}

type CategoriesListControlsTopDispatch = ThunkDispatch<
  CategoryItem[],
  void,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
> &
  ThunkDispatch<ProductItem[], ProductsFilter, GetProductsListSuccessAction | GetProductsListErrorAction> &
  Dispatch<CreateDraftCategoryAction>;

const mapDispatchToProps = (dispatch: CategoriesListControlsTopDispatch): DispatchToPropsMapResult => {
  return {
    getCategories: (): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories());
    },
    createDraftCategory: (draftCategory: CategoryItem): void => {
      dispatch(createDraftCategory(draftCategory));
    },
    getProducts: (filter: ProductsFilter): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListControlsTop);
