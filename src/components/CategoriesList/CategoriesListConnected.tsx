import { connect } from 'react-redux';
import CategoriesList from './CategoriesList';
import { CategoryItem } from '../../models';
import { GetCategoriesListDispatchProp, GetCategoriesListDispatch } from '../../action-types';
import { FoodDiaryState, DataFetchState } from '../../store';
import { getCategories } from '../../action-creators';

type CategoriesListDispatch = GetCategoriesListDispatch;

export interface CategoriesListStateToPropsMapResult {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
  categoryDraftItems: CategoryItem[];
}

export interface CategoriesListDispatchToPropsMapResult {
  getCategories: GetCategoriesListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): CategoriesListStateToPropsMapResult => {
  return {
    categoryItems: state.categories.list.categoryItems,
    categoryItemsFetchState: state.categories.list.categoryItemsFetchState,
    categoryDraftItems: state.categories.list.categoryDraftItems,
  };
};

const mapDispatchToProps = (dispatch: CategoriesListDispatch): CategoriesListDispatchToPropsMapResult => {
  const getCategoriesProp: GetCategoriesListDispatchProp = () => {
    return dispatch(getCategories());
  };

  return {
    getCategories: getCategoriesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);
