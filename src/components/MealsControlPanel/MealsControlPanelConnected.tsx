import { connect } from 'react-redux';
import MealsControlPanel from '.';
import { MealType } from '../../models';
import { Dispatch } from 'redux';
import { SetCollapsedForAllMealsAction } from '../../action-types';
import { setCollapsedForAllMeals } from '../../action-creators';
import { RootState } from '../../store';

type MealsControlPanelDispatch = Dispatch<SetCollapsedForAllMealsAction>;

export interface MealsControlPanelStateToProps {
  isPageContentLoading: boolean;
}

export interface MealsControlPanelDispatchToPropsMapResult {
  setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]) => void;
}

const mapStateToProps = (state: RootState): MealsControlPanelStateToProps => {
  return {
    isPageContentLoading: state.notes.list.notesForPageFetchState.loading,
  };
};

const mapDispatchToProps = (dispatch: MealsControlPanelDispatch): MealsControlPanelDispatchToPropsMapResult => {
  return {
    setCollapsedForAllMeals: (collapsed: boolean, meals: MealType[]): void => {
      dispatch(setCollapsedForAllMeals(collapsed, meals));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsControlPanel);
