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
import { CategoryCreateEdit, CategoryItem, CategoryEditRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  editableCategoriesIds: number[];
  isCategoryOperationInProcess: boolean;
  isProductOperationInProcess: boolean;
  areProductsLoading: boolean;
}

export interface DispatchToPropsMapResult {
  setEditableForCategories: (categoriesIds: number[], editable: boolean) => void;
  deleteDraftCategory: (draftCategoryId: number) => void;
  createCategory: (category: CategoryCreateEdit) => Promise<CreateCategorySuccessAction | CreateCategoryErrorAction>;
  editCategory: (request: CategoryEditRequest) => Promise<EditCategorySuccessAction | EditCategoryErrorAction>;
  deleteCategory: (categoryId: number) => Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction>;
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    editableCategoriesIds: state.categories.list.editableCategoriesIds,
    isCategoryOperationInProcess: state.categories.operations.status.performing,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    areProductsLoading: state.products.list.productItemsFetchState.loading,
  };
};

type CategoriesListItemDispatch = Dispatch<SetEditableForCategoriesAction> &
  Dispatch<DeleteDraftCategoryAction> &
  ThunkDispatch<void, CategoryCreateEdit, CreateCategorySuccessAction | CreateCategoryErrorAction> &
  ThunkDispatch<void, CategoryEditRequest, EditCategorySuccessAction | EditCategoryErrorAction> &
  ThunkDispatch<void, number, DeleteCategorySuccessAction | DeleteCategoryErrorAction> &
  ThunkDispatch<CategoryItem[], void, GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;

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
    editCategory: (request: CategoryEditRequest): Promise<EditCategorySuccessAction | EditCategoryErrorAction> => {
      return dispatch(editCategory(request));
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
