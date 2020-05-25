import { connect } from 'react-redux';
import CategoryCreateForm from './CategoryCreateForm';
import { Dispatch } from 'redux';
import {
  CloseModalAction,
  CreateCategoryDispatch,
  GetCategoriesListDispatch,
  CreateCategoryDispatchProp,
  GetCategoriesListDispatchProp,
} from '../../action-types';
import { closeModal, createCategory, getCategories } from '../../action-creators';
import { CategoryCreateEdit } from '../../models';

type CategoryCreateFormDispatch = Dispatch<CloseModalAction> & CreateCategoryDispatch & GetCategoriesListDispatch;

export interface CategoryCreateFormDispatchToPropsMapResult {
  closeModal: () => void;
  createCategory: CreateCategoryDispatchProp;
  getCategories: GetCategoriesListDispatchProp;
}

const mapDispatchToProps = (dispatch: CategoryCreateFormDispatch): CategoryCreateFormDispatchToPropsMapResult => {
  const createCategoryProp: CreateCategoryDispatchProp = (category: CategoryCreateEdit) => {
    return dispatch(createCategory(category));
  };

  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },

    createCategory: createCategoryProp,
    getCategories: getCategoriesProp,
  };
};

export default connect(null, mapDispatchToProps)(CategoryCreateForm);
