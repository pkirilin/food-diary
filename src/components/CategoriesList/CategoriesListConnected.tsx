import { connect } from 'react-redux';
import CategoriesList from './CategoriesList';
import { CategoryItem } from '../../models';
import { GetCategoriesListSuccessAction, GetCategoriesListErrorAction } from '../../action-types';
import { FoodDiaryState, DataFetchState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { getCategories } from '../../action-creators';

export interface StateToPropsMapResult {
  categoryItems: CategoryItem[];
  categoryItemsFetchState: DataFetchState;
  categoryDraftItems: CategoryItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    categoryItems: state.categories.list.categoryItems,
    categoryItemsFetchState: state.categories.list.categoryItemsFetchState,
    categoryDraftItems: state.categories.list.categoryDraftItems,
  };
};

export interface DispatchToPropsMapResult {
  getCategories: () => Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>;
}

type CategoriesListDispatch = ThunkDispatch<
  CategoryItem[],
  void,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;

const mapDispatchToProps = (dispatch: CategoriesListDispatch): DispatchToPropsMapResult => {
  return {
    getCategories: (): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
      return dispatch(getCategories());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);
