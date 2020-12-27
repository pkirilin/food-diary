import { connect } from 'react-redux';
import PagesFilterForm from './PagesFilterForm';
import { Dispatch } from 'redux';
import { CloseModalAction, UpdatePagesFilterAction } from '../../action-types';
import { closeModal, updateFilter } from '../../action-creators';
import { PagesFilter } from '../../models';
import { RootState } from '../../store';

type PagesFilterFormDispatch = Dispatch<CloseModalAction | UpdatePagesFilterAction>;

export interface PagesFilterFormStateToPropsMapResult {
  pagesFilter: PagesFilter;
}

export interface PagesFilterFormDispatchToPropsMapResult {
  closeModal: () => void;
  updatePagesFilter: (updatedFilter: PagesFilter) => void;
}

const mapStateToProps = (state: RootState): PagesFilterFormStateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter.params,
  };
};

const mapDispatchToProps = (dispatch: PagesFilterFormDispatch): PagesFilterFormDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },

    updatePagesFilter: (updatedFilter: PagesFilter): void => {
      dispatch(updateFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesFilterForm);
