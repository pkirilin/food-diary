import { connect } from 'react-redux';
import CategoriesListItemEditable from './CategoriesListItemEditable';
import { DataOperationState, DataFetchState, FoodDiaryState } from '../../store';
import { ProductsFilter, CategoryCreateEdit, CategoryEditRequest, CategoryItem, ProductItem } from '../../models';
import {
  CreateCategorySuccessAction,
  CreateCategoryErrorAction,
  EditCategorySuccessAction,
  EditCategoryErrorAction,
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetProductsListSuccessAction,
  GetProductsListErrorAction,
  SetEditableForCategoriesAction,
  DeleteDraftCategoryAction,
} from '../../action-types';
import { Dispatch } from 'react';
import { ThunkDispatch } from 'redux-thunk';
import {
  setEditableForCategories,
  deleteDraftCategory,
  createCategory,
  editCategory,
  getCategories,
  getProducts,
} from '../../action-creators';

export interface StateToPropsMapResult {
  categoryOperationStatus: DataOperationState;
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

export interface DispatchToPropsMapResult {
  createCategory: (category: CategoryCreateEdit) => Promise<CreateCategorySuccessAction | CreateCategoryErrorAction>;
  editCategory: (request: CategoryEditRequest) => Promise<EditCategorySuccessAction | EditCategoryErrorAction>;
  deleteDraftCategory: (draftCategoryId: number) => void;
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
  getProducts: (filter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  setEditableForCategories: (categoriesIds: number[], editable: boolean) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    categoryOperationStatus: state.categories.operations.status,
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    productsFilter: state.products.filter,
  };
};

type CategoriesListItemDispatch = Dispatch<SetEditableForCategoriesAction | DeleteDraftCategoryAction> &
  ThunkDispatch<void, CategoryCreateEdit, CreateCategorySuccessAction | CreateCategoryErrorAction> &
  ThunkDispatch<void, CategoryEditRequest, EditCategorySuccessAction | EditCategoryErrorAction> &
  ThunkDispatch<CategoryItem[], void, GetCategoriesListSuccessAction | GetCategoriesListErrorAction> &
  ThunkDispatch<ProductItem[], ProductsFilter, GetProductsListSuccessAction | GetProductsListErrorAction>;

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
    getCategories: (): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories());
    },
    getProducts: (filter: ProductsFilter): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListItemEditable);
