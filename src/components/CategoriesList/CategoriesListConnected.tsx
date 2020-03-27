import { connect } from 'react-redux';
import CategoriesList from './CategoriesList';
import { CategoryItem, CategoriesFilter } from '../../models';
import { GetCategoriesListSuccessAction, GetCategoriesListErrorAction } from '../../action-types';
import { FoodDiaryState, DataFetchState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { getCategories } from '../../action-creators';

export interface StateToPropsMapResult {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    categoryItems: state.categories.list.categoryItems,
    categoryItemsFetchState: state.categories.list.categoryItemsFetchState,
  };
};

export interface DispatchToPropsMapResult {
  getCategories: (filter: CategoriesFilter) => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

type CategoriesListDispatch = ThunkDispatch<
  CategoryItem[],
  CategoriesFilter,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;

const mapDispatchToProps = (dispatch: CategoriesListDispatch): DispatchToPropsMapResult => {
  return {
    getCategories: (
      filter: CategoriesFilter,
    ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories(filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);
