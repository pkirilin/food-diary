import { connect } from 'react-redux';
import MealsList from './MealsList';
import { DataFetchState, RootState } from '../../store';
import { Dispatch } from 'redux';
import { ExpandAllMealsAction } from '../../action-types';
import { expandAllMeals } from '../../action-creators';

type MealsListDispatch = Dispatch<ExpandAllMealsAction>;

export interface MealsListStateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

export interface MealsListDispatchToPropsMapResult {
  expandAllMeals: () => void;
}

const mapStateToProps = (state: RootState): MealsListStateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
  };
};

const mapDispatchToProps = (dispatch: MealsListDispatch): MealsListDispatchToPropsMapResult => {
  return {
    expandAllMeals: (): void => {
      dispatch(expandAllMeals());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsList);
