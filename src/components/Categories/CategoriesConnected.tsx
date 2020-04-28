import { connect } from 'react-redux';
import Categories from './Categories';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';

export interface DispatchToPropsMapResult {
  clearProductsFilter: () => void;
}

type CategoriesDispatch = Dispatch<ClearProductsFilterAction>;

const mapDispatchToProps = (dispatch: CategoriesDispatch): DispatchToPropsMapResult => {
  return {
    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(null, mapDispatchToProps)(Categories);
