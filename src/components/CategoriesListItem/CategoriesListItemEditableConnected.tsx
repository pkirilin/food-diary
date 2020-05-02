import { connect } from 'react-redux';
import CategoriesListItemEditable from './CategoriesListItemEditable';
import { DataOperationState, DataFetchState, RootState } from '../../store';
import { ProductsFilter, CategoryCreateEdit, CategoryEditRequest } from '../../models';
import {
  SetEditableForCategoriesAction,
  DeleteDraftCategoryAction,
  CreateCategoryDispatch,
  EditCategoryDispatch,
  GetCategoriesListDispatch,
  GetProductsListDispatch,
  CreateCategoryDispatchProp,
  EditCategoryDispatchProp,
  GetCategoriesListDispatchProp,
  GetProductsListDispatchProp,
} from '../../action-types';
import { Dispatch } from 'react';
import {
  setEditableForCategories,
  deleteDraftCategory,
  createCategory,
  editCategory,
  getCategories,
  getProducts,
} from '../../action-creators';

type CategoriesListItemDispatch = Dispatch<SetEditableForCategoriesAction | DeleteDraftCategoryAction> &
  CreateCategoryDispatch &
  EditCategoryDispatch &
  GetCategoriesListDispatch &
  GetProductsListDispatch;

export interface CategoriesListItemEditableStateToPropsMapResult {
  categoryOperationStatus: DataOperationState;
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  productsFilter: ProductsFilter;
}

export interface CategoriesListItemEditableDispatchToPropsMapResult {
  deleteDraftCategory: (draftCategoryId: number) => void;
  setEditableForCategories: (categoriesIds: number[], editable: boolean) => void;
  createCategory: CreateCategoryDispatchProp;
  editCategory: EditCategoryDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
  getProducts: GetProductsListDispatchProp;
}

const mapStateToProps = (state: RootState): CategoriesListItemEditableStateToPropsMapResult => {
  return {
    categoryOperationStatus: state.categories.operations.status,
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    productsFilter: state.products.filter.params,
  };
};

const mapDispatchToProps = (
  dispatch: CategoriesListItemDispatch,
): CategoriesListItemEditableDispatchToPropsMapResult => {
  const createCategoryProp: CreateCategoryDispatchProp = (category: CategoryCreateEdit) => {
    return dispatch(createCategory(category));
  };

  const editCategoryProp: EditCategoryDispatchProp = (request: CategoryEditRequest) => {
    return dispatch(editCategory(request));
  };

  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  const getProductsProp: GetProductsListDispatchProp = (filter: ProductsFilter) => {
    return dispatch(getProducts(filter));
  };

  return {
    setEditableForCategories: (categoriesIds: number[], editable: boolean): void => {
      dispatch(setEditableForCategories(categoriesIds, editable));
    },

    deleteDraftCategory: (draftCategoryId: number): void => {
      dispatch(deleteDraftCategory(draftCategoryId));
    },

    createCategory: createCategoryProp,
    editCategory: editCategoryProp,
    getCategories: getCategoriesProp,
    getProducts: getProductsProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesListItemEditable);
