import { connect } from 'react-redux';
import CategoriesListItem from './CategoriesListItem';
import { FoodDiaryState, DataOperationState, DataFetchState } from '../../store';
import { Dispatch } from 'redux';
import {
  SetEditableForCategoriesAction,
  DeleteCategorySuccessAction,
  DeleteCategoryErrorAction,
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
} from '../../action-types';
import { setEditableForCategories, deleteCategory, getCategories } from '../../action-creators';
import { CategoryItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  categoryOperationStatus: DataOperationState;
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  editableCategoriesIds: number[];
}

export interface DispatchToPropsMapResult {
  setEditableForCategories: (categoriesIds: number[], editable: boolean) => void;
  deleteCategory: (categoryId: number) => Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction>;
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    categoryOperationStatus: state.categories.operations.status,
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    editableCategoriesIds: state.categories.list.editableCategoriesIds,
  };
};

type CategoriesListItemDispatch = Dispatch<SetEditableForCategoriesAction> &
  ThunkDispatch<void, number, DeleteCategorySuccessAction | DeleteCategoryErrorAction> &
  ThunkDispatch<CategoryItem[], void, GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;

const mapDispatchToProps = (dispatch: CategoriesListItemDispatch): DispatchToPropsMapResult => {
  return {
    setEditableForCategories: (categoriesIds: number[], editable: boolean): void => {
      dispatch(setEditableForCategories(categoriesIds, editable));
    },
    deleteCategory: (categoryId: number): Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction> => {
      return dispatch(deleteCategory(categoryId));
    },
    getCategories: (): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListItem);
