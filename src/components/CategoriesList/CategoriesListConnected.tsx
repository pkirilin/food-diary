import { connect } from 'react-redux';
import CategoriesList from './CategoriesList';
import { CategoryItem } from '../../models';
import { GetCategoriesListDispatchProp, GetCategoriesListDispatch } from '../../action-types';
import { RootState, DataFetchState } from '../../store';
import { getCategories } from '../../action-creators';

type CategoriesListDispatch = GetCategoriesListDispatch;

export interface CategoriesListStateToPropsMapResult {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
}

export interface CategoriesListDispatchToPropsMapResult {
  getCategories: GetCategoriesListDispatchProp;
}

const mapStateToProps = (state: RootState): CategoriesListStateToPropsMapResult => {
  return {
    categoryItems: state.categories.list.categoryItems,
    categoryItemsFetchState: state.categories.list.categoryItemsFetchState,
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
