import { connect } from 'react-redux';
import MealsList from './MealsList';
import { DataFetchState, RootState } from '../../store';
import { Dispatch } from 'redux';
import { SetCollapsedForAllMealsAction } from '../../action-types';
import { setCollapsedForAllMeals } from '../../action-creators';
import { MealType } from '../../models';

type MealsListDispatch = Dispatch<SetCollapsedForAllMealsAction>;

export interface MealsListStateToPropsMapResult {
  notesForPageFetchState: DataFetchState;
}

export interface MealsListDispatchToPropsMapResult {
  setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]) => void;
}

const mapStateToProps = (state: RootState): MealsListStateToPropsMapResult => {
  return {
    notesForPageFetchState: state.notes.list.notesForPageFetchState,
  };
};

const mapDispatchToProps = (dispatch: MealsListDispatch): MealsListDispatchToPropsMapResult => {
  return {
    setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]): void => {
      dispatch(setCollapsedForAllMeals(collapsed, meals));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsList);
