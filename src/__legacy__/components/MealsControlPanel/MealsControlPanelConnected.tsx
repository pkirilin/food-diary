import { connect } from 'react-redux';
import MealsControlPanel from '.';
import { Dispatch } from 'redux';
import { RootState } from '../../store';
import { CollapseAllMealsAction, ExpandAllMealsAction } from '../../action-types';
import { collapseAllMeals, expandAllMeals } from '../../action-creators';

type MealsControlPanelDispatch = Dispatch<ExpandAllMealsAction | CollapseAllMealsAction>;

export interface MealsControlPanelStateToProps {
  isPageContentLoading: boolean;
}

export interface MealsControlPanelDispatchToPropsMapResult {
  expandAllMeals: () => void;
  collapseAllMeals: () => void;
}

const mapStateToProps = (state: RootState): MealsControlPanelStateToProps => {
  return {
    isPageContentLoading: state.notes.list.notesForPageFetchState.loading,
  };
};

const mapDispatchToProps = (dispatch: MealsControlPanelDispatch): MealsControlPanelDispatchToPropsMapResult => {
  return {
    expandAllMeals: (): void => {
      dispatch(expandAllMeals());
    },
    collapseAllMeals: (): void => {
      dispatch(collapseAllMeals());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MealsControlPanel);
