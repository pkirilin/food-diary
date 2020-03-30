import { connect } from 'react-redux';
import CategoriesListItem from './CategoriesListItem';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import {
  SetEditableForCategoriesAction,
  DeleteDraftCategoryAction,
  CreateCategorySuccessAction,
  CreateCategoryErrorAction,
  EditCategorySuccessAction,
  EditCategoryErrorAction,
  DeleteCategorySuccessAction,
  DeleteCategoryErrorAction,
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
} from '../../action-types';
import {
  setEditableForCategories,
  deleteDraftCategory,
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
} from '../../action-creators';
import { CategoryCreateEdit, CategoriesFilter, CategoryItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  editableCategoriesIds: number[];
  isCategoryOperationInProcess: boolean;
}

export interface DispatchToPropsMapResult {
  setEditableForCategories: (categoriesIds: number[], editable: boolean) => void;
  deleteDraftCategory: (draftCategoryId: number) => void;
  createCategory: (category: CategoryCreateEdit) => Promise<CreateCategorySuccessAction | CreateCategoryErrorAction>;
  editCategory: (category: CategoryCreateEdit) => Promise<EditCategorySuccessAction | EditCategoryErrorAction>;
  deleteCategory: (categoryId: number) => Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction>;
  getCategories: (filter: CategoriesFilter) => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    editableCategoriesIds: state.categories.list.editableCategoriesIds,
    isCategoryOperationInProcess: state.categories.operations.status.performing,
  };
};

type CategoriesListItemDispatch = Dispatch<SetEditableForCategoriesAction> &
  Dispatch<DeleteDraftCategoryAction> &
  ThunkDispatch<void, CategoryCreateEdit, CreateCategorySuccessAction | CreateCategoryErrorAction> &
  ThunkDispatch<void, CategoryCreateEdit, EditCategorySuccessAction | EditCategoryErrorAction> &
  ThunkDispatch<void, number, DeleteCategorySuccessAction | DeleteCategoryErrorAction> &
  ThunkDispatch<CategoryItem[], CategoriesFilter, GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;

const mapDispatchToProps = (dispatch: CategoriesListItemDispatch): DispatchToPropsMapResult => {
  return {
    setEditableForCategories: (categoriesIds: number[], editable: boolean): void => {
      dispatch(setEditableForCategories(categoriesIds, editable));
    },
    deleteDraftCategory: (draftCategoryId: number): void => {
      dispatch(deleteDraftCategory(draftCategoryId));
    },
    createCategory: (
      category: CategoryCreateEdit,
    ): Promise<CreateCategorySuccessAction | CreateCategoryErrorAction> => {
      return dispatch(createCategory(category));
    },
    editCategory: (category: CategoryCreateEdit): Promise<EditCategorySuccessAction | EditCategoryErrorAction> => {
      return dispatch(editCategory(category));
    },
    deleteCategory: (categoryId: number): Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction> => {
      return dispatch(deleteCategory(categoryId));
    },
    getCategories: (
      filter: CategoriesFilter,
    ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListItem);
