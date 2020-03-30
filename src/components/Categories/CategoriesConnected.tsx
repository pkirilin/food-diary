import { connect } from 'react-redux';
import Categories from './Categories';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isCategoriesListAvailable: boolean;
  firstCategoryId?: number;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isCategoriesListAvailable: state.categories.list.categoryItemsFetchState.loaded,
    firstCategoryId:
      state.categories.list.categoryItems.length > 0 ? state.categories.list.categoryItems[0].id : undefined,
  };
};

export default connect(mapStateToProps)(Categories);
