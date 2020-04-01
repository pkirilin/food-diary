import { connect } from 'react-redux';
import CategoriesListControlsTop from './CategoriesListControlsTop';
import { ThunkDispatch } from 'redux-thunk';
import { CategoryItem, CategoriesFilter } from '../../models';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  CreateDraftCategoryAction,
} from '../../action-types';
import { Dispatch } from 'redux';
import { createDraftCategory, getCategories } from '../../action-creators';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isCategoryOperationInProcess: boolean;
  isProductOperationInProcess: boolean;
  areCategoriesLoading: boolean;
  areProductsLoading: boolean;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    areCategoriesLoading: state.categories.list.categoryItemsFetchState.loading,
    areProductsLoading: state.products.list.productItemsFetchState.loading,
  };
};

export interface DispatchToPropsMapResult {
  getCategories: (filter: CategoriesFilter) => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
  createDraftCategory: (draftCategory: CategoryItem) => void;
}

type CategoriesListControlsTopDispatch = ThunkDispatch<
  CategoryItem[],
  CategoriesFilter,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
> &
  Dispatch<CreateDraftCategoryAction>;

const mapDispatchToProps = (dispatch: CategoriesListControlsTopDispatch): DispatchToPropsMapResult => {
  return {
    getCategories: (
      filter: CategoriesFilter,
    ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories(filter));
    },
    createDraftCategory: (draftCategory: CategoryItem): void => {
      dispatch(createDraftCategory(draftCategory));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListControlsTop);
